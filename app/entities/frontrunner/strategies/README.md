# Trading Strategies

There are currently two trading strategies implemented.

## Open - Close Strategy

1. When each new block is mined, the prices from the oracles of all the watched synths is fetched, also the same price is fetched from SNX but they are identical, so I'll only use the "oracle price" onwards.
2. Every 2 seconds, the bot queries kraken, coinbase, bitfinex for the synths that are supported, and produces averages out of these prices.
3. On each heartbeat (the 2 seconds we fetch new feed prices) an decision making happens. If any of the "oracle price synth" compared to the "feed price synth" is over the trigger threshold, the bot will buy that synth. The threshold was set to 0.5% so it'd be more than the 0.4% that SNX fee is.
4. Once the trade is open, the bot now enters into an "open trade" mode, where it monitors each new block and expects the Oracle price to change, towards any direction, just change. This stage can take from seconds to minutes as the oracles are slow to update.
5. As long as the bot is in "open trade" mode, it will also keep checking the feed price. If the feed price becomes unfavorable, i.e. it drops sharply, the bot has a "cut losses" trigger that will immediately sell the asset back to USD and close the position.
6. The moment the oracle changes price, the bot sells the synth back to sUSD and the trade closes.

This is a losing strategy, as SNX fee is paid twice, once on buy and once on sell, thus it becomes 0.8%. There are very rare opportunities that exceed 0.8%.

## Roam Strategy

Roaming strategy is similar to open-close, the "open part", except it checks across all assets for opportunities and does not use USD as the pivot token.

For example, if the bot holds UNI and we have the following divergences:

-   "BTCUSD": "-0.39%",
-   "ETHUSD": "0.30%",
-   "LINKUSD": "-1.02%",
-   "UNIUSD": "-0.58%",
-   "AAVEUSD": "0.63%",

The bot will determine that there is a tradeing opportunity between UNI (-0.58%) and AAAVE (+0.63) for a total of +1.21%. It will execute the trade, exchanging UNI for AAVE and stop. Wait for the next cross-token opportunity, so on and so forth.

ℹ️ The roam strategy to work, cannot even hold sUSD, it needs to start with any other synth.
