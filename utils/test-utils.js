const namehash = require('eth-ens-namehash').hash;
const Web3Utils = require('web3-utils');
const keccak256 = Web3Utils.sha3;

/*
// https://ethereum.stackexchange.com/questions/21509/truffle-testrpc-time-manipulation
// https://ethereum.stackexchange.com/questions/15755/simulating-the-passage-of-time-with-testrpc
// https://github.com/DigixGlobal/tempo/blob/master/lib/index.js
*/
function sendRpc(web3, method, params) {
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
        sha3: keccak256(tld)
    };
}

function getNodeFromDomain(name, tld) {
    return {
        sha3: keccak256(name),
        namehash: namehash(`${name}.${tld}`),
    };
}

async function createDomainName(web3, Deed, theDomainName, testTLD, ens, registrar, initialDomainOwner) {
    const rootNode = getRootNodeFromTLD(testTLD);
    const testDomain = getNodeFromDomain(theDomainName, testTLD);

    console.log(`getRootNodeFromTLD(${testTLD}) => `, rootNode);
    console.log(`getNodeFromDomain(${theDomainName}, ${testTLD}) => `, testDomain);

    // const TIME_AFTER_SOFT_LAUNCH = 80 * 7 * 24 * 60 * 60;
    // const TIME_DELTA = 2 * 24 * 60 * 60 + 1;
    const TIME_AFTER_SOFT_LAUNCH = 20;
    const TIME_DELTA = 2 * 60 + 1;

    await sendRpc(web3, 'evm_increaseTime', [TIME_AFTER_SOFT_LAUNCH]);

    const nodeEntryBeforeStartAuction = (await registrar.entries(testDomain.sha3))[0];

    assert.strictEqual(nodeEntryBeforeStartAuction.toString(), '0', 'Bad nodeEntryBeforeStartAuction');

    console.log(`About to start the auction for ${theDomainName}`);
    const startAuctionResult = await registrar.startAuction(testDomain.sha3, {
        from: initialDomainOwner,
        gas: 100000
    });
    console.log('registrar.startAuction => ', startAuctionResult, startAuctionResult.receipt.logs[0], startAuctionResult.logs[0].args);

    const nodeEntryAfterStartAuction = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryAfterStartAuction.toString(), '1', 'Bad nodeEntryAfterStartAuction');

    //////// Move 2 days and start bidding ////////

    console.log(await sendRpc(web3, 'evm_increaseTime', [TIME_DELTA]));

    const nodeEntryBeforeSealBid = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryBeforeSealBid.toString(), '1', 'Bad nodeEntryBeforeSealBid');

    // Place the bid (the real bid is 1 ETH but is concealed as 2 ETH)
    const sealedBid = await registrar.shaBid(testDomain.sha3, initialDomainOwner, web3.toWei(1, 'ether'), keccak256('secret'));
    console.log('sealedBid => ', sealedBid);
    const newBidResult = await registrar.newBid(sealedBid, {
        from: initialDomainOwner,
        value: web3.toWei(2, 'ether'),
        gas: 500000
    });
    console.log('newBidResult => ', newBidResult, newBidResult.receipt.logs[0], newBidResult.logs[0].args);

    const nodeEntryAfterSealBid = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryAfterSealBid.toString(), '1', 'Bad nodeEntryAfterSealBid');

    //////// Move 2 days and reveal the bid ////////

    console.log(await sendRpc(web3, 'evm_increaseTime', [TIME_DELTA]));

    const nodeEntryBeforeUnsealBid = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryBeforeUnsealBid.toString(), '4', 'Bad nodeEntryBeforeUnsealBid');

    const unsealBidResult = await registrar.unsealBid(testDomain.sha3, web3.toWei(1, 'ether'), keccak256('secret'), {
        from: initialDomainOwner,
        gas: 500000
    });
    console.log('unsealBidResult => ', unsealBidResult, unsealBidResult.receipt.logs[0], unsealBidResult.logs[0].args);

    const nodeEntryAfterUnsealBid = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryAfterUnsealBid.toString(), '4', 'Bad nodeEntryAfterUnsealBid');

    //////// Move 2 days and finalize the auction ////////

    console.log(await sendRpc(web3, 'evm_increaseTime', [TIME_DELTA]));

    // TODO: deedContract.at(registrar.entries(keccak256('name'))[1]).owner();
    // TODO: web3.fromWei(registrar.entries(keccak256('name'))[4], 'ether');

    const nodeEntryBeforeFinalizeAuction = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryBeforeFinalizeAuction.toString(), '2', 'Bad nodeEntryBeforeFinalizeAuction');

    const finalizeAuctionResult = await registrar.finalizeAuction(testDomain.sha3, {
        from: initialDomainOwner,
        gas: 500000
    });
    console.log('finalizeAuctionResult => ', finalizeAuctionResult, finalizeAuctionResult.receipt.logs[0], finalizeAuctionResult.logs[0].args);

    const nodeEntryAfterFinalizeAuction = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryAfterFinalizeAuction.toString(), '2', 'Bad nodeEntryAfterFinalizeAuction');

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

    const transferDeedResult = await registrar.transfer(testDomain.sha3, initialDomainOwner, {
        from: initialDomainOwner
    });
    console.log('transferDeedResult => ', transferDeedResult, transferDeedResult.receipt.logs[0], transferDeedResult.receipt.logs[1]);

    const theDeedOwner2 = await theDeed.owner();
    console.log('theDeedOwner2 => ', theDeedOwner2);
    assert.strictEqual(initialDomainOwner, theDeedOwner2);

    //////// Check the owner and resolver ////////

    assert.strictEqual(await ens.owner(testDomain.namehash), initialDomainOwner);
    assert.strictEqual(await ens.resolver(testDomain.namehash), "0x0000000000000000000000000000000000000000");

    await ens.setOwner(testDomain.namehash, initialDomainOwner, {from: initialDomainOwner});
    assert.strictEqual(await ens.owner(testDomain.namehash), initialDomainOwner);
    assert.strictEqual(await ens.resolver(testDomain.namehash), "0x0000000000000000000000000000000000000000");

    //await ens.setResolver(testDomain.namehash, resolverAddress, {from: initialDomainOwner});
    //assert.strictEqual(await ens.owner(testDomain.namehash), initialDomainOwner);
    //assert.strictEqual(await ens.resolver(testDomain.namehash), resolverAddress);

    return { theDeed };
}

module.exports = {
    sendRpc,
    getRootNodeFromTLD,
    getNodeFromDomain,
    createDomainName
};
