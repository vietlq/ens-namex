// https://github.com/poanetwork/solidity-flattener
// https://loomx.io/developers/docs/en/web3js-loom-provider-truffle.html
// https://ethereum.stackexchange.com/questions/8299/what-are-truffle-migrations
// https://hackernoon.com/ethereum-development-walkthrough-part-2-truffle-ganache-geth-and-mist-8d6320e12269
// https://www.polarsparc.com/xhtml/Ethereum-Web-App.html
// $ geth --identity "test" --datadir ./data/test -ethash.dagdir ./data/test --networkid "21" --maxpeers 0 --nodiscover --ipcdisable --rpc --rpcaddr 127.0.0.1 --rpcport 8081 --rpcapi "web3,eth,personal" --port 30001 --rpccorsdomain "*" --verbosity 2 console

var Deed = artifacts.require("@ensdomains/ens/contracts/Deed");
var ENS = artifacts.require("@ensdomains/ens/contracts/ENSRegistry");
// var Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
var Registrar = artifacts.require('./ens/Registrar');

var DirectListing = artifacts.require('./DirectListing');

const namehash = require('eth-ens-namehash').hash;

const LocalTestUtils = require('../utils/test-utils.js');
//import { sendRpc, getRootNodeFromTLD, getNodeFromDomain, createDomainName } from "./utils/test-utils.js";
const sendRpc = LocalTestUtils.sendRpc;
const getRootNodeFromTLD = LocalTestUtils.getRootNodeFromTLD;
const getNodeFromDomain = LocalTestUtils.getNodeFromDomain;
const createDomainName = LocalTestUtils.createDomainName;

/*
module.exports = async function (deployer, network, accounts) {
    // Use TLD .namex because .eth is already taken
    var tld = 'namex';
    console.log('network => ', network);

    var rootNode = getRootNodeFromTLD(tld);

    await deployer.deploy(ENS);
    await deployer.deploy(Registrar, ENS.address, rootNode.namehash, 0);
    await deployer.deploy(DirectListing, Registrar.address);

    await ENS.at(ENS.address).setSubnodeOwner('0x0', rootNode.sha3, Registrar.address);

    // Deploy the DirectListing contract
    console.log('ENS.address => ', ENS.address);
    console.log('Registrar.address => ', Registrar.address);

    // Create custom domains
    if (network == 'development') {
        const testTLD = 'namex';
        const theDomainName = 'testingname';
        const initialDomainOwner = accounts[1];
        console.log('deployer => ', deployer);

        var ens = ENS.at(ENS.address);
        var registrar = Registrar.at(Registrar.address);

        var web3 = new(require('web3'))(deployer.provider);

        const { theDeed } = await createDomainName(web3, Deed, theDomainName, testTLD, ens, registrar, initialDomainOwner);
    }
};
*/

// Force Truffle to update JSON files and add the field "networks"
// https://github.com/trufflesuite/truffle/issues/688
// https://github.com/trufflesuite/truffle/issues/758

module.exports = async function (deployer, network, accounts) {
    // Use TLD .namex because .eth is already taken
    var tld = 'namex';
    console.log('network => ', network);

    var rootNode = getRootNodeFromTLD(tld);

    return deployer.then(() => {
        return deployer.deploy(ENS);
    }).then((ens) => {
        return deployer.deploy(Registrar, ENS.address, rootNode.namehash, 0);
    }).then((registrar) => {
        return deployer.deploy(DirectListing, Registrar.address);
    }).then((directListing) => {
        return ENS.at(ENS.address).setSubnodeOwner('0x0', rootNode.sha3, Registrar.address);
    }).then((setSubnodeOwnerResult) => {
        // Deploy the DirectListing contract
        console.log('ENS.address => ', ENS.address);
        console.log('Registrar.address => ', Registrar.address);
        console.log('DirectListing.address => ', DirectListing.address);
        console.log('setSubnodeOwnerResult => ', setSubnodeOwnerResult);

        // Create custom domains
        if (network == 'development') {
            const testTLD = 'namex';
            const theDomainName = 'testingname';
            const initialDomainOwner = accounts[1];
            console.log('deployer => ', deployer);

            var ens = ENS.at(ENS.address);
            var registrar = Registrar.at(Registrar.address);

            var web3 = new(require('web3'))(deployer.provider);

            return createDomainName(web3, Deed, theDomainName, testTLD, ens, registrar, initialDomainOwner);
        }
    }).then((theDeed) => {
        console.log('theDeed => ', theDeed);
    });
};
