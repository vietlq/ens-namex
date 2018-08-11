var DirectListing = artifacts.require('./DirectListing');
var Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
var ENS = artifacts.require('@ensdomains/ens/contracts/ENSRegistry');
var Deed = artifacts.require('@ensdomains/ens/contracts/Deed');
var namehash = require('eth-ens-namehash').hash;

// https://docs.ens.domains/en/latest/userguide.html
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

contract('DirectListing', function (accounts) {

    it('Offer', async () => {
        const rootNode = getRootNodeFromTLD('eth');
        const theDomainName = 'testingname.eth';
        const testDomain = getRootNodeFromTLD(theDomainName);
        const initialDomainOwner = accounts[1];

        const ens = await ENS.new();

        const registrar = await Registrar.new(ens.address, rootNode.namehash, 0);

        const p2 = await ens.setSubnodeOwner('0x0', rootNode.sha3, registrar.address);
        console.log('ens.setSubnodeOwner => ', p2, p2.receipt.logs[0], p2.logs[0].args);
        assert.strictEqual(await ens.owner(rootNode.namehash), registrar.address);
        assert.strictEqual(await ens.owner(rootNode.sha3), "0x0000000000000000000000000000000000000000");
        assert.strictEqual(await ens.resolver(rootNode.sha3), "0x0000000000000000000000000000000000000000");

        const TIME_80_WEEKS = 80 * 7 * 24 * 60 * 60;
        const TIME_2_DAYS = 2 * 24 * 60 * 60 + 1;
        const TIME_3_DAYS = 3 * 24 * 60 * 60 + 1;
        await sendRpc('evm_increaseTime', [TIME_80_WEEKS]);

        const nodeEntryBeforeAuction = (await registrar.entries(testDomain.sha3))[0];
        const price = 10;

        assert.strictEqual(nodeEntryBeforeAuction.toString(), '5', 'Bad nodeEntryBeforeAuction');

        console.log(`About to start the auction for ${theDomainName}`);
        const p3 = await registrar.startAuction(testDomain.sha3, {
            from: initialDomainOwner,
            gas: 100000
        });
        console.log('registrar.startAuction => ', p3, p3.receipt.logs[0], p3.logs[0].args);

        const nodeEntryAfterAuction = (await registrar.entries(testDomain.sha3))[0];
        assert.strictEqual(nodeEntryAfterAuction.toString(), '1', 'Bad nodeEntryAfterAuction');

        //////// Move 2 days and start bidding ////////

        console.log(await sendRpc('evm_increaseTime', [TIME_2_DAYS]));

        const nodeEntryAfterAuction2 = (await registrar.entries(testDomain.sha3))[0];
        assert.strictEqual(nodeEntryAfterAuction2.toString(), '1', 'Bad nodeEntryAfterAuction2');

        // Place the bid (the real bid is 1 ETH but is concealed as 2 ETH)
        const sealedBid = await registrar.shaBid(testDomain.sha3, initialDomainOwner, web3.toWei(1, 'ether'), web3.sha3('secret'));
        console.log('sealedBid => ', sealedBid);
        const newBidResult = await registrar.newBid(sealedBid, {from: initialDomainOwner, value: web3.toWei(2, 'ether'), gas: 500000});
        console.log('newBidResult => ', newBidResult, newBidResult.receipt.logs[0], newBidResult.logs[0].args);

        const nodeEntryAfterAuction3 = (await registrar.entries(testDomain.sha3))[0];
        assert.strictEqual(nodeEntryAfterAuction3.toString(), '1', 'Bad nodeEntryAfterAuction3');

        //////// Move 2 days and reveal the bid ////////

        console.log(await sendRpc('evm_increaseTime', [TIME_2_DAYS]));

        const nodeEntryAfterAuction4 = (await registrar.entries(testDomain.sha3))[0];
        assert.strictEqual(nodeEntryAfterAuction4.toString(), '1', 'Bad nodeEntryAfterAuction4');

        const unsealBidResult = await registrar.unsealBid(testDomain.sha3, web3.toWei(1, 'ether'), web3.sha3('secret'), {from: initialDomainOwner, gas: 500000});
        console.log('unsealBidResult => ', unsealBidResult, unsealBidResult.receipt.logs[0], unsealBidResult.logs[0].args);

        const nodeEntryAfterAuction5 = (await registrar.entries(testDomain.sha3))[0];
        assert.strictEqual(nodeEntryAfterAuction5.toString(), '4', 'Bad nodeEntryAfterAuction5');

        //////// Move 2 days and finalize the auction ////////

        console.log(await sendRpc('evm_increaseTime', [TIME_2_DAYS]));

        // TODO: deedContract.at(registrar.entries(web3.sha3('name'))[1]).owner();
        // TODO: web3.fromWei(registrar.entries(web3.sha3('name'))[4], 'ether');

        const nodeEntryAfterAuction6 = (await registrar.entries(testDomain.sha3))[0];
        assert.strictEqual(nodeEntryAfterAuction6.toString(), '4', 'Bad nodeEntryAfterAuction6');

        const finalizeAuctionResult = await registrar.finalizeAuction(testDomain.sha3, {from: initialDomainOwner, gas: 500000});
        console.log('finalizeAuctionResult => ', finalizeAuctionResult, finalizeAuctionResult.receipt.logs[0], finalizeAuctionResult.logs[0].args);

        const nodeEntryAfterAuction7 = (await registrar.entries(testDomain.sha3))[0];
        assert.strictEqual(nodeEntryAfterAuction7.toString(), '2', 'Bad nodeEntryAfterAuction7');

        //////// Transfer the winning deed to the winner ////////
        /*
        mapping (bytes32 => Entry) _entries;

        struct Entry {
            Deed deed;
            uint registrationDate;
            uint value;
            uint highestBid;
        }
        */

        const theEntry = await registrar.entries(testDomain.sha3);
        console.log('theEntry => ', theEntry);
        const theDeed = Deed.at(theEntry[1]);
        const theDeedOwner = await theDeed.owner();
        console.log('theDeedOwner => ', theDeedOwner);
        assert.strictEqual(initialDomainOwner, theDeedOwner);

        const transferDeedResult = await registrar.transfer(testDomain.sha3, initialDomainOwner, {from: initialDomainOwner});
        console.log('transferDeedResult => ', transferDeedResult, transferDeedResult.receipt.logs[0], transferDeedResult.receipt.logs[1]);

        const theDeedOwner2 = await theDeed.owner();
        console.log('theDeedOwner2 => ', theDeedOwner2);
        assert.strictEqual(initialDomainOwner, theDeedOwner2);

        //////// Check the owner and resolver ////////

        assert.strictEqual(await ens.owner(testDomain.namehash), "0x0000000000000000000000000000000000000000");
        assert.strictEqual(await ens.resolver(testDomain.namehash), "0x0000000000000000000000000000000000000000");

        //await ens.setOwner(testDomain.namehash, initialDomainOwner, {from: initialDomainOwner});
        //assert.strictEqual(await ens.owner(testDomain.namehash), initialDomainOwner);
        //assert.strictEqual(await ens.resolver(testDomain.namehash), "0x0000000000000000000000000000000000000000");

        //await ens.setResolver(testDomain.namehash, resolverAddress, {from: initialDomainOwner});
        //assert.strictEqual(await ens.owner(testDomain.namehash), initialDomainOwner);
        //assert.strictEqual(await ens.resolver(testDomain.namehash), resolverAddress);

        //////// Deposit the domain from the owner to the DirectListing contract ////////

        const contract = await DirectListing.new(registrar.address);

        const depositDomainResult = await registrar.transfer(testDomain.sha3, contract.address, {from: initialDomainOwner});
        console.log('depositDomainResult => ', depositDomainResult, depositDomainResult.receipt.logs[0], depositDomainResult.receipt.logs[1]);

        const theDeedOwner3 = await theDeed.owner();
        console.log('theDeedOwner3 => ', theDeedOwner3);
        assert.strictEqual(contract.address, theDeedOwner3);
        assert.strictEqual(await theDeed.previousOwner(), initialDomainOwner);

        // const event = contract.Offered({
        //     _from: initialDomainOwner
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
        //     assert.strictEqual(result.args.owner, initialDomainOwner, 'Should have matched the creator');
        //     assert.strictEqual(result.args.price, price, 'Should have matched the offered price');
        //     assert.strictEqual(result.args.node, testDomain.sha3, 'Should have matched the matched label node');
        // });

        // const p2 = contract.offer(testDomain.sha3, price, 10, {
        //     from: initialDomainOwner
        // });

        // return Promise.all([p1, p2]);
    });
});
