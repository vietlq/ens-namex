var DirectListing = artifacts.require('./DirectListing');
var Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
var ENS = artifacts.require('@ensdomains/ens/contracts/ENSRegistry');
var namehash = require('eth-ens-namehash').hash;

// https://ethereum.stackexchange.com/questions/21509/truffle-testrpc-time-manipulation
// https://ethereum.stackexchange.com/questions/15755/simulating-the-passage-of-time-with-testrpc
// https://github.com/DigixGlobal/tempo/blob/master/lib/index.js

function sendRpc(method, params) {
    return new Promise(function (resolve) {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: method,
            params: params || [],
            id: new Date().getTime()
        }, function (err, res) {
            resolve(res);
        });
    });
}

/**
 * Calculate root testDomain hashes given the top level domain(tld)
 *
 * @param {string} tld plain text tld, for example: 'eth'
 */
function getRootNodeFromTLD(tld) {
    return {
        namehash: namehash(tld),
        sha3: web3.sha3(tld)
    };
}

contract('DirectListing', function (accounts) {

    it('Offer', async () => {
        var rootNode = getRootNodeFromTLD('eth');
        const theDomainName = 'testingname.eth';

        const ens = await ENS.new();

        const registrar = await Registrar.new(ens.address, rootNode.namehash, 0);

        const p2 = await ens.setSubnodeOwner('0x0', rootNode.sha3, registrar.address);
        console.log('ens.setSubnodeOwner => ', p2, p2.receipt.logs[0], p2.logs[0].args);

        const contract = await DirectListing.new(registrar.address);

        const TIME_80_WEEKS = 80 * 7 * 24 * 60 * 60;
        const TIME_2_DAYS = 2 * 24 * 60 * 60 + 1;
        const TIME_3_DAYS = 3 * 24 * 60 * 60 + 1;
        await sendRpc('evm_increaseTime', [TIME_80_WEEKS]);

        const testDomain = web3.sha3(theDomainName);
        const nodeEntryBeforeAuction = (await registrar.entries(testDomain))[0];
        const price = 10;

        assert.strictEqual(nodeEntryBeforeAuction.toString(), '5', 'Bad nodeEntryBeforeAuction');

        console.log(`About to start the auction for ${theDomainName}`);
        const p3 = await registrar.startAuction(testDomain, {
            from: accounts[0],
            gas: 100000
        });
        console.log('registrar.startAuction => ', p3, p3.receipt.logs[0], p3.logs[0].args);

        const nodeEntryAfterAuction = (await registrar.entries(testDomain))[0];
        assert.strictEqual(nodeEntryAfterAuction.toString(), '1', 'Bad nodeEntryAfterAuction');

        //assert.strictEqual(nodeEntryBeforeAuction.toString(), '1', 'Bad nodeEntryBeforeAuction');

        console.log(await sendRpc('evm_increaseTime', [TIME_2_DAYS]));

        const nodeEntryAfterAuction2 = (await registrar.entries(testDomain))[0];
        assert.strictEqual(nodeEntryAfterAuction2.toString(), '1', 'Bad nodeEntryAfterAuction2');

        console.log(await sendRpc('evm_increaseTime', [TIME_2_DAYS]));

        const nodeEntryAfterAuction3 = (await registrar.entries(testDomain))[0];
        assert.strictEqual(nodeEntryAfterAuction3.toString(), '1', 'Bad nodeEntryAfterAuction3');

        console.log(await sendRpc('evm_increaseTime', [TIME_2_DAYS]));

        const nodeEntryAfterAuction4 = (await registrar.entries(testDomain))[0];
        assert.strictEqual(nodeEntryAfterAuction4.toString(), '1', 'Bad nodeEntryAfterAuction4');


        // const event = contract.Offered({
        //     _from: accounts[0]
        // }, {
        //     fromBlock: 0,
        //     toBlock: 'latest'
        // });

        // const p1 = new Promise((resolve, reject) => {
        //     event.watch((error, result) => {
        //         if (error) return reject(error);

        //         resolve(result);
        //     });
        // }).then((result) => {
        //     assert.equal(result.args.owner, accounts[0], 'Should have matched the creator');
        //     assert.equal(result.args.price, price, 'Should have matched the offered price');
        //     assert.equal(result.args.testDomain, testDomain, 'Should have matched the matched label testDomain');
        // });

        // const p2 = contract.offer(testDomain, price, 10, {
        //     from: accounts[0]
        // });

        // return Promise.all([p1, p2]);
    });
});
