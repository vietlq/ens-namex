// https://github.com/poanetwork/solidity-flattener
const ENS = artifacts.require("@ensdomains/ens/contracts/ENSRegistry");
const FIFSRegistrar = artifacts.require('./ens/Registrar');
const DirectListing = artifacts.require('./DirectListing');

const Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
const web3 = new(require('web3'))();
const namehash = require('eth-ens-namehash').hash;

/**
 * Calculate root node hashes given the top level domain(tld)
 *
 * @param {string} tld plain text tld, for example: 'eth'
 */
function getRootNodeFromTLD(tld) {
    return {
        namehash: namehash(tld),
        sha3: web3.sha3(tld)
    };
}

module.exports = async function (deployer, network) {
    // Use TLD .namex because .eth is already taken
    var tld = 'namex';
    console.log('network => ', network);

    var rootNode = getRootNodeFromTLD(tld);

    await deployer.deploy(ENS);
    await deployer.deploy(Registrar, ENS.address, rootNode.namehash, 0);
    await ENS.at(ENS.address).setSubnodeOwner('0x0', rootNode.sha3, Registrar.address);

    // Deploy the DirectListing contract
    console.log('ENS.address => ', ENS.address);
    console.log('Registrar.address => ', Registrar.address);

    await deployer.deploy(DirectListing, Registrar.address);
};
