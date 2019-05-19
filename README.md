# ENS NameX

An ENS domain exchange.

## Key Files

* `contracts/DirectListing.sol` - the exchange contract
* `src/` - UI using Truffle's Drizzle
* `test/DirectListing.test.js` - example interacting with contract

## Requirements

### Original Dependencies

* At least Ganache CLI v6.1.6 (ganache-core: 2.1.5). Older Ganache CLI has a bug in timing API
* Ganache GUI should be at least v1.2.1 (CLI v6.1.6, ganache-core: 2.1.5). Older version has bugs from older Ganache CLI

### Lastest Dependencies (2019-05-19)

* Node v10.15.3
* Solidity v0.5.0 (solc-js)
* Truffle v5.0.18 (core: 5.0.18)
* Web3.js v1.0.0-beta.37
* Ganache CLI v6.4.3 (ganache-core: 2.5.5)

NOTE: NodeJS v12.x breaks Truffle v5.0, so stay with NodeJS v10.x

To install NodeJS, NPM, Truffle, Ganache-UI, Ganache-CLI, and Drizzle, refer to:

* https://github.com/nvm-sh/nvm
* https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04
* https://github.com/trufflesuite/truffle
* https://github.com/trufflesuite/ganache-cli
* https://truffleframework.com/ganache
* https://truffleframework.com/drizzle

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

## Development Tips

* VS Code
* http://juan.blanco.ws/solidity-contracts-in-visual-studio-code/
* https://medium.com/coinmonks/solidity-import-in-vs-code-the-right-way-82baa1cc5a71
* https://medium.com/codechain/solidity-language-support-for-vscode-541edf23e43d

## Quick & Dirty Deployment Process

* Use https://github.com/poanetwork/solidity-flattener to flatten the solidity files
* Use https://remix.ethereum.org/ to compile
* Use MetaMask (Rinkeby) + Remix to deploy
* Beg for ETH on Rinkeby if you haven't done so: https://faucet.rinkeby.io/
