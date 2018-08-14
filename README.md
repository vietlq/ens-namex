# ENS NameX

An ENS domain exchange.

## Key Files

* `contracts/DirectListing.sol` - the exchange contract
* `src/` - UI using Truffle's Drizzle
* `test/DirectListing.test.js` - example interacting with contract

## Local Development

With an already running local node (or `ganache-cli`, or `ganache GUI`):

1. Remove old contracts, build, deploy & update the JSON files for UI

```
rm -rf build/* && npm run deploy && npm run cp-contracts
```

2. Start the UI

```
npm start
```

For `yarn`: `truffle migrate && yarn cp-contracts && yarn start`

## Requirements

* At least Ganache CLI v6.1.6 (ganache-core: 2.1.5). Older Ganache CLI has a bug in timing API
* Ganache GUI should be at least v1.2.1 (CLI v6.1.6, ganache-core: 2.1.5). Older version has bugs from older Ganache CLI

## Quick & Dirty Deployment Process

* Use https://github.com/poanetwork/solidity-flattener to flatten the solidity files
* Use https://remix.ethereum.org/ to compile
* Use MetaMask (Rinkeby) + Remix to deploy
* Beg for ETH on Rinkeby if you haven't done so: https://faucet.rinkeby.io/
