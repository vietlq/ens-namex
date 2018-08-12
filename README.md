# ENS NameX

An ENS domain exchange.

## Key Files

* `contracts/DirectListing.sol` - the exchange contract
* `src/` - UI using Truffle's Drizzle
* `test/DirectListing.test.js` - example interacting with contract

## Quick & Dirty Deployment Process

* Use https://github.com/poanetwork/solidity-flattener to flatten the solidity files
* Use https://remix.ethereum.org/ to compile
* Use MetaMask (Rinkeby) + Remix to deploy
* Beg for ETH on Rinkeby if you haven't done so: https://faucet.rinkeby.io/

## Resulting Contracts

* ENSRegistry: https://rinkeby.etherscan.io/tx/0x225997d8e3eeb58ee87da2f79804745224f1555729e12b18d19725f19ac8f7c9
* Registrar: https://rinkeby.etherscan.io/tx/0x06c4335c84e1a7678dbcf57a62003e9069cebd0e089317e3ebbd90b9b6719829
* DirectListing: https://rinkeby.etherscan.io/tx/0x36c90a51ef55d8931a8301110200882d3989886025d793eab3da40aa3c5be511
