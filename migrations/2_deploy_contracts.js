// https://github.com/poanetwork/solidity-flattener

const Deed = artifacts.require("@ensdomains/ens/contracts/Deed");
const ENS = artifacts.require("@ensdomains/ens/contracts/ENSRegistry");
// const Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
const Registrar = artifacts.require('./ens/Registrar');

const DirectListing = artifacts.require('./DirectListing');

const web3 = new(require('web3'))();
const namehash = require('eth-ens-namehash').hash;

const LocalTestUtils = require('../utils/test-utils.js');
//import { sendRpc, getRootNodeFromTLD, getNodeFromDomain, createDomainName } from "./utils/test-utils.js";
const sendRpc = LocalTestUtils.sendRpc;
const getRootNodeFromTLD = LocalTestUtils.getRootNodeFromTLD;
const getNodeFromDomain = LocalTestUtils.getNodeFromDomain;
const createDomainName = LocalTestUtils.createDomainName;

module.exports = async function (deployer, network, accounts) {
    // Use TLD .namex because .eth is already taken
    var tld = 'namex';
    console.log('network => ', network);

    var rootNode = getRootNodeFromTLD(tld);

    deployer.deploy(ENS);
    deployer.deploy(Registrar, ENS.address, rootNode.namehash, 0);
    deployer.deploy(DirectListing, Registrar.address);

    await ENS.at(ENS.address).setSubnodeOwner('0x0', rootNode.sha3, Registrar.address);

    // Deploy the DirectListing contract
    console.log('ENS.address => ', ENS.address);
    console.log('Registrar.address => ', Registrar.address);

    // Create custom domains
    if (network == 'development') {
        const testTLD = 'namex';
        const theDomainName = 'testingname';
        const initialDomainOwner = accounts[1];

        var ens = ENS.at(ENS.address);
        var registrar = Registrar.at(Registrar.address);

        //const { theDeed } = await createDomainName(web3, Deed, theDomainName, testTLD, ens, registrar, initialDomainOwner);
    }
};
