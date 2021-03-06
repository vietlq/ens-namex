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

getNodeFromDomain(testingname, namex) =>  {
    namehash: '0x8618cdf525b91ec9d864ede34602298893d75fe87bdbb52b3a9be442ca42190c',
    sha3: '0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a'
}
```

registrar.shaBid
```
VALUE: 0.01 ETH = '0x000000000000000000000000000000000000000000000000002386f26fc10000'
keccak256('secret') => 0x65462b0520ef7d3df61b9992ed3bea0c56ead753be7c8b3614e0ce01e4cac41b

 decoded input 	{
	"bytes32 hash": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
	"address owner": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
	"uint256 value": "10000000000000000",
	"bytes32 salt": "0x65462b0520ef7d3df61b9992ed3bea0c56ead753be7c8b3614e0ce01e4cac41b"
}
 decoded output 	{
	"0": "bytes32: 0x7febbe090d84944174217995751fba9281a04dac1cfb741b02e8244af7c1e62d"
}

registrar.startAuction
https://rinkeby.etherscan.io/tx/0x0b2001c807756c490484115836d28a4f989f35869d02355e68fbb84098eb6cf3

registrar.newBid
https://rinkeby.etherscan.io/tx/0xd8cd55792259f93977fc790ab00934e8a7796d34c6efa2938a8b6180f2e3ea1e

registrar.unsealBid
https://rinkeby.etherscan.io/tx/0x3cfbb86d07417d9b12252eaf413680b74b0b8574d331c2459a7981e47e29ffcf

 decoded input 	{
	"bytes32 _hash": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
	"uint256 _value": "10000000000000000",
	"bytes32 _salt": "0x65462b0520ef7d3df61b9992ed3bea0c56ead753be7c8b3614e0ce01e4cac41b"
}
 decoded output 	 -
 logs 	[
	{
		"from": "0x1e14145c595c3a675772f81ba38390b4e3d20875",
		"topic": "0x7b6c4b278d165a6b33958f8ea5dfb00c8c9d4d0acf1985bef5d10786898bc3e7",
		"event": "BidRevealed",
		"args": {
			"0": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"1": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
			"2": "10000000000000000",
			"3": 2,
			"hash": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"owner": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
			"value": "10000000000000000",
			"status": 2,
			"length": 4
		}
	}
]

registrar.finalizeAuction
https://rinkeby.etherscan.io/tx/0x5dd6e7cc3f443f332d67648b3e54da7f2084c065706a2f96998f7a7ce1f17d16

decoded input 	{
	"bytes32 _hash": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a"
}
 decoded output 	 -
 logs 	[
	{
		"from": "0x14f0bcd639f9491bdd73278e7fac1134e7b58ad4",
		"topic": "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82",
		"event": "NewOwner",
		"args": {
			"0": "0x47094c149c96e975f4a7186684446790195e4f60b18508dd5116918643139341",
			"1": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"2": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
			"node": "0x47094c149c96e975f4a7186684446790195e4f60b18508dd5116918643139341",
			"label": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"owner": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
			"length": 3
		}
	},
	{
		"from": "0x1e14145c595c3a675772f81ba38390b4e3d20875",
		"topic": "0x0f0c27adfd84b60b6f456b0e87cdccb1e5fb9603991588d87fa99f5b6b61e670",
		"event": "HashRegistered",
		"args": {
			"0": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"1": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
			"2": "10000000000000000",
			"3": "1534089608",
			"hash": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"owner": "0x5b163D25EBB842e4DD09697e62Ff3927096B2C5A",
			"value": "10000000000000000",
			"registrationDate": "1534089608",
			"length": 4
		}
	}
]

registrar.transfer
https://rinkeby.etherscan.io/tx/0x9ee2086bd4edd99c27221f99a40407287b293660f26b3042405041e09d4b1d52

 decoded input 	{
	"bytes32 _hash": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
	"address newOwner": "0xfe179B8446Be6d0801227c1b1FeA768db9C0B093"
}
 decoded output 	 -
 logs 	[
	{
		"from": "0x124f70d53e15814e4c661ec2c7751caf909e4ac6",
		"topic": "0xa2ea9883a321a3e97b8266c2b078bfeec6d50c711ed71f874a90d500ae2eaf36",
		"event": "OwnerChanged",
		"args": {
			"0": "0xfe179B8446Be6d0801227c1b1FeA768db9C0B093",
			"newOwner": "0xfe179B8446Be6d0801227c1b1FeA768db9C0B093",
			"length": 1
		}
	},
	{
		"from": "0x14f0bcd639f9491bdd73278e7fac1134e7b58ad4",
		"topic": "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82",
		"event": "NewOwner",
		"args": {
			"0": "0x47094c149c96e975f4a7186684446790195e4f60b18508dd5116918643139341",
			"1": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"2": "0xfe179B8446Be6d0801227c1b1FeA768db9C0B093",
			"node": "0x47094c149c96e975f4a7186684446790195e4f60b18508dd5116918643139341",
			"label": "0x67899db9134af0f78e42c55f2b5e1baa371065ebd991cff53bf354f2c1fd500a",
			"owner": "0xfe179B8446Be6d0801227c1b1FeA768db9C0B093",
			"length": 3
		}
	}
]
```
