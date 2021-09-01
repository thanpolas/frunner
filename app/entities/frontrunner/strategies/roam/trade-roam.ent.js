/**
 * @fileoverview Decision maker - roaming strategy.
 */

const config = require('config');
const { poolTokensToAuto } = require('@thanpolas/crypto-utils');

const {
  PAIRS_AR,
  PairsToSynths,
  SynthsToPairs,
} = require('../../../price-feeds');

const {
  create: tradeCreate,
  update: tradeUpdate,
  getById: tradeGetById,
} = require('../../sql/trades-roam.sql');
const { snxTrade, SYNTH_DECIMALS } = require('../../../synthetix');

const { wait, divergenceHr } = require('../../../../utils/helpers');

const log = require('../../../../services/log.service').get();

const entity = (module.exports = {});

/** @type {boolean} Toggle to avoid race conditions */
let performingTrade = false;

/**
 * Discover and execute new trading opportunities, roam strategy.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object?} activeOpportunity Current active opportunity if one exists.
 * @return {Promise<Object|void>} A promise with the new trade record if any.
 * @private
 */
entity.findOpportunity = async (divergencies, activeOpportunity) => {
  if (activeOpportunity) {
    return;
  }
  if (performingTrade) {
    return;
  }

  const opportunities = await entity._findOpportunities(divergencies);

  if (!opportunities.length) {
    return;
  }

  entity._sortOpportunities(opportunities);

  const [bestOpportunity] = opportunities;

  const tradeRecord = await entity._executeOpportunity(bestOpportunity);

  return tradeRecord;
};

/**
 * Sorts the opportunities in place based on the divergence (higher first).
 *
 * @param {Array<Object>} opportunities The opportunities.
 * @private
 */
entity._sortOpportunities = (opportunities) => {
  opportunities.sort((a, b) => {
    if (
      a.opportunity_source_target_diff_percent >
      b.opportunity_source_target_diff_percent
    ) {
      return -1;
    }
    if (
      a.opportunity_source_target_diff_percent <
      b.opportunity_source_target_diff_percent
    ) {
      return 1;
    }
    return 0;
  });
};

/**
 * Will determine if there are trading opportunities based on the oracle
 * divergence threshold of each token and amongst them.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @return {Array<Object>} Opportunities objects.
 * @private
 */
entity._findOpportunities = async (divergencies) => {
  const { currentTokenSymbol } = divergencies;
  const sourcePair = SynthsToPairs[currentTokenSymbol];
  const { oracleToFeed } = divergencies;
  // Reverse sign to get the distance between the source token divergence
  // and the candidate token divergence.
  const sourceDivergence = oracleToFeed[sourcePair];
  const sourceDivergenceRev = sourceDivergence * -1;

  const opportunities = [];
  PAIRS_AR.forEach((pair) => {
    if (pair === sourcePair) {
      return;
    }
    const targetSourceSymbol = PairsToSynths[pair];
    const targetDivergence = oracleToFeed[pair];
    const sourceVsTargetDivergence = sourceDivergenceRev + targetDivergence;

    const divergenceThreshold = config.app.divergence_threshold;
    if (sourceVsTargetDivergence < divergenceThreshold) {
      return;
    }

    // There is a trading opportunity, create it
    const opportunity = {
      opportunity_source_symbol: currentTokenSymbol,
      opportunity_source_feed_price: divergencies.state.feedPrices[sourcePair],
      opportunity_source_oracle_price:
        divergencies.state.oraclePrices[sourcePair],
      opportunity_source_usd_diff_percent: sourceDivergence,
      opportunity_source_usd_diff_percent_hr: divergenceHr(sourceDivergence),

      opportunity_target_symbol: targetSourceSymbol,
      opportunity_target_feed_price: divergencies.state.feedPrices[pair],
      opportunity_target_oracle_price: divergencies.state.oraclePrices[pair],
      opportunity_target_usd_diff_percent: targetDivergence,
      opportunity_target_usd_diff_percent_hr: divergenceHr(targetDivergence),

      opportunity_source_target_diff_percent: sourceVsTargetDivergence,
      opportunity_source_target_diff_percent_hr: divergenceHr(
        sourceVsTargetDivergence,
      ),
      opportunity_block_number: divergencies.state.blockNumber,

      network: config.app.network,
      testing: config.app.testing,
    };

    opportunities.push(opportunity);
  });

  return opportunities;
};

/**
 * Execute the opportunity.
 *
 * @param {Object} divergencies The calculated divergencies.
 * @param {Object} bestOpportunity Local opportunity object.
 * @return {Promise<Object>} A Promise with the created trade record.
 * @private
 */
entity._executeOpportunity = async (bestOpportunity) => {
  try {
    performingTrade = true;
    const tradeRecord = await entity._createTradeRecord(bestOpportunity);

    let tx;
    if (config.app.testing) {
      // On testing, emulate trade TX, as if it takes 2s.
      await wait(2000);
    } else {
      // Actually execute the trade.
      tx = await entity._performTrade(bestOpportunity);
    }

    const updatedTradeRecord = await entity._updateTradeRecord(tradeRecord, tx);

    return updatedTradeRecord;
  } catch (ex) {
    await log.error('Failed to put roaming trade', { error: ex, relay: true });
  } finally {
    performingTrade = false;
  }
};

/**
 * Create the initial trade-roam record.
 *
 * @param {Object} bestOpportunity Local opportunity object.
 * @return {Promise<Object>} A Promise with the created record.
 * @private
 */
entity._createTradeRecord = async (bestOpportunity) => {
  const tradeId = await tradeCreate(bestOpportunity);
  const tradeRecord = await tradeGetById(tradeId);

  return tradeRecord;
};

/**
 * Will perform the actual trade, if all the conditions are met.
 *
 * @param {Object} bestOpportunity Local opportunity object.
 * @return {Promise<Object|void>} A Promise with the tx object or empty.
 * @private
 */
entity._performTrade = async (bestOpportunity) => {
  const { opportunity_source_symbol, opportunity_target_symbol } =
    bestOpportunity;

  const tx = await snxTrade(
    opportunity_source_symbol,
    opportunity_target_symbol,
  );

  return tx;
};

/**
 * Updates the trade record with the executed trade.
 *
 * @param {Object} tradeRecord The created trade record.
 * @param {Object=} tx Transaction object of the trade or empty if testing.
 * @return {Promise<Object>} A Promise with the updated trade record.
 * @private
 */
entity._updateTradeRecord = async (tradeRecord, tx) => {
  const { id: tradeId } = tradeRecord;

  let traded_tx = '0x';
  let traded_block_number = 0;
  let traded_source_tokens = 10000;
  let traded_dst_tokens = 10000;
  let traded_gas_spent = 0;
  let traded_actual_ratio_between_tokens = 1;

  if (tx) {
    traded_tx = tx.transactionHash;
    traded_block_number = tx.blockNumber;
    traded_source_tokens = tx.sourceTokenQuantityReadable;
    traded_dst_tokens = tx.dstTokenQuantityReadable;
    traded_gas_spent = tx.gasUsed.toString();

    const tokenFraction = [traded_source_tokens, traded_dst_tokens];
    const decimalFraction = [SYNTH_DECIMALS, SYNTH_DECIMALS];
    traded_actual_ratio_between_tokens = poolTokensToAuto(
      tokenFraction,
      decimalFraction,
    );
  }

  const tradeUpdateData = {
    traded_tx,
    traded_block_number,
    traded_source_tokens,
    traded_dst_tokens,
    traded_gas_spent,
    traded_actual_ratio_between_tokens,
  };

  await tradeUpdate(tradeId, tradeUpdateData);

  const updatedTradeRecord = await tradeGetById(tradeId);

  return updatedTradeRecord;
};
