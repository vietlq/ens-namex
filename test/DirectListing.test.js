const DirectListing = artifacts.require('./DirectListing');
const Registrar = artifacts.require('./Registrar');
// var Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
const ENS = artifacts.require('@ensdomains/ens/contracts/ENSRegistry');
const Deed = artifacts.require('@ensdomains/ens/contracts/Deed');
const namehash = require('eth-ens-namehash').hash;
const LocalTestUtils = require('../utils/test-utils.js');
//import { sendRpc, getRootNodeFromTLD, getNodeFromDomain, createDomainName } from "./utils/test-utils.js";
const sendRpc = LocalTestUtils.sendRpc;
const getRootNodeFromTLD = LocalTestUtils.getRootNodeFromTLD;
const getNodeFromDomain = LocalTestUtils.getNodeFromDomain;
const createDomainName = LocalTestUtils.createDomainName;

// https://docs.ens.domains/en/latest/userguide.html
// http://docs.ens.domains/en/latest/introduction.html
// https://github.com/poanetwork/solidity-flattener

/*
Note that on Rinkeby one must deploy his/her one ENSRegistry because the one by ENS supports only .test TLD
0xe7410170f87102df0055eb195163a03b7f2bff4a
http://docs.ens.domains/en/latest/introduction.html
*/

contract('DirectListing', function (accounts) {

    it('Offer', async () => {
        const testTLD = 'namex';
        const rootNode = getRootNodeFromTLD(testTLD);

        const ens = await ENS.new();
        const registrar = await Registrar.new(ens.address, rootNode.namehash, 0);
        const directListing = await DirectListing.new(registrar.address);
        const setSubnodeOwnerResult = await ens.setSubnodeOwner('0x0', rootNode.sha3, registrar.address);

        console.log('ens.setSubnodeOwner => ', setSubnodeOwnerResult, setSubnodeOwnerResult.receipt.logs[0], setSubnodeOwnerResult.logs[0].args);
        assert.strictEqual(await ens.owner(rootNode.namehash), registrar.address);
        assert.strictEqual(await ens.resolver(rootNode.namehash), "0x0000000000000000000000000000000000000000");

        const testDefaultTLD = 'eth';
        const theDomainName = 'testingname';
        const testDomain = getNodeFromDomain(theDomainName, testTLD);
        const initialDomainOwner = accounts[1];

        const { theDeed } = await createDomainName(web3, assert, Deed, theDomainName, testTLD, ens, registrar, initialDomainOwner);

        //////// Deposit the domain from the owner to the DirectListing contract ////////

        const depositDomainResult = await registrar.transfer(testDomain.sha3, directListing.address, {
            from: initialDomainOwner
        });
        console.log('depositDomainResult => ', depositDomainResult, depositDomainResult.receipt.logs[0], depositDomainResult.receipt.logs[1]);
        assert.strictEqual(await ens.owner(testDomain.namehash), directListing.address);
        assert.strictEqual(await ens.resolver(testDomain.namehash), "0x0000000000000000000000000000000000000000");

        const theDeedOwner3 = await theDeed.owner();
        console.log('theDeedOwner3 => ', theDeedOwner3);
        assert.strictEqual(directListing.address, theDeedOwner3);
        assert.strictEqual(await theDeed.previousOwner(), initialDomainOwner);

        const event = directListing.Offered({
            _from: initialDomainOwner
        }, {
            fromBlock: 0,
            toBlock: 'latest'
        });

        const price = web3.toWei(0.1, 'ether');

        const domainOfferedEvent = new Promise((resolve, reject) => {
            event.watch((error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        }).then((result) => {
            console.log('result.args.price => ', result.args.price);
            assert.strictEqual(result.args.owner, initialDomainOwner, 'Should have matched the creator');
            assert.strictEqual(result.args.price.toString(), price, 'Should have matched the offered price');
            assert.strictEqual(result.args.node, testDomain.sha3, 'Should have matched the matched label node');
        });

        const offerDomainResult = directListing.offer(testDomain.sha3, price, 10, {
            from: initialDomainOwner
        });

        return Promise.all([domainOfferedEvent, offerDomainResult]);
    });
});
