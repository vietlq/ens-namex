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

* ENSRegistry: https://rinkeby.etherscan.io/tx/0xfc731775a18266f4463195007d3f3645fb1a1ae76a66bea0967122a48852d047
* Registrar: https://rinkeby.etherscan.io/tx/0xd6326dfca810d02ad6b7e2bd036aa76ceb5dc6f95d86662dea3fc6f02e5e3f13
* Set Registrar as the owner of TLD .namex: https://rinkeby.etherscan.io/tx/0xacd6867071f736b65f6322c7035ff350d7a4f8c99fbe5836793ebd1f4c3dad1c
* DirectListing: https://rinkeby.etherscan.io/tx/0x378ff8dc1c170c0a762800808167fc6187729a25b6ed0e0880b09009e00c9281

```
  Contract: DirectListing

getRootNodeFromTLD(namex) =>  {
    namehash: '0x47094c149c96e975f4a7186684446790195e4f60b18508dd5116918643139341',
    sha3: '0x09d5e21dcaff2c807ec99c756118ec2519c72627ded2e59c335ecfc98ef4b445'
}

getRootNodeFromTLD(testingname.namex) =>  {
    namehash: '0x8618cdf525b91ec9d864ede34602298893d75fe87bdbb52b3a9be442ca42190c',
    sha3: '0x10a195d8a7771e08ea3a322fe5b6112943d47570446535c0953140dfc811a5a9'
}
```

registrar.shaBid
```
 decoded input 	{
	"bytes32 hash": "0x09d5e21dcaff2c807ec99c756118ec2519c72627ded2e59c335ecfc98ef4b445",
	"address owner": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
	"uint256 value": "1000000000000000000",
	"bytes32 salt": "0x65462b0520ef7d3df61b9992ed3bea0c56ead753be7c8b3614e0ce01e4cac41b"
}
 decoded output 	{
	"0": "bytes32: 0x0c5586c4ac9b15385721e510f888c9444b542e3ad563eba32432d296c6490a35"
}

registrar.startAuction
https://rinkeby.etherscan.io/tx/0x2be276d3ff1d5c679a3c756c7dde8496bd909530743cdc8ffd3c978d69d4fd3d

registrar.newBid
https://rinkeby.etherscan.io/tx/0x86e55ee0a5fddcb4f1967f9e625b5132764510892909a466b0127120a390784d
```

## Local Development

With an already running local node:

1. `truffle migrate`
2. `yarn cp-contracts`
3. `yarn start`
