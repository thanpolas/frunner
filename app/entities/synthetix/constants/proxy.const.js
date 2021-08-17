/**
 * @fileoverview Proxy constants from the synthetix SDK.
 */

const consts = (module.exports = {});

/**
 * @const {Object} Proxy constants from the synthetix SDK.
 * @see https://github1s.com/Synthetixio/kwenta/blob/HEAD/sections/exchange/hooks/useBalancerExchange.tsx#L56-L57
 */
consts.BALANCER_LINKS = {
  mainnet: {
    poolsUrl:
      'https://storageapi.fleek.co/balancer-bucket/balancer-exchange/pools',
    proxyAddr: '0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21', // Balancer Mainnet proxy
  },
  kovan: {
    poolsUrl:
      'https://ipfs.fleek.co/ipns/balancer-team-bucket.storage.fleek.co/balancer-exchange-kovan/pools',
    proxyAddr: '0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec', // Kovan proxy
  },
};

/** @const {string} OP_KOVAN_PROXY Proxy to interact with on Optimistic kovan */
consts.OP_KOVAN_PROXY = '0x0064a673267696049938aa47595dd0b3c2e705a1';
