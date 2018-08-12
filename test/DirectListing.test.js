var DirectListing = artifacts.require('./DirectListing');
var Registrar = artifacts.require('./Registrar');
// var Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
var ENS = artifacts.require('@ensdomains/ens/contracts/ENSRegistry');
var Deed = artifacts.require('@ensdomains/ens/contracts/Deed');
var namehash = require('eth-ens-namehash').hash;

// https://docs.ens.domains/en/latest/userguide.html
// http://docs.ens.domains/en/latest/introduction.html
// https://ethereum.stackexchange.com/questions/21509/truffle-testrpc-time-manipulation
// https://ethereum.stackexchange.com/questions/15755/simulating-the-passage-of-time-with-testrpc
// https://github.com/DigixGlobal/tempo/blob/master/lib/index.js
// https://github.com/poanetwork/solidity-flattener

/*
Note that on Rinkeby one must deploy his/her one ENSRegistry because the one by ENS supports only .test TLD
0xe7410170f87102df0055eb195163a03b7f2bff4a
http://docs.ens.domains/en/latest/introduction.html
*/

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

function getNodeFromDomain(name, tld) {
    return {
        sha3: web3.sha3(name),
        namehash: namehash(`${name}.${tld}`),
    };
}

async function createDomainName(assert, Deed, theDomainName, testTLD, ens, registrar, initialDomainOwner) {
    const rootNode = getRootNodeFromTLD(testTLD);
    const testDomain = getNodeFromDomain(theDomainName, testTLD);

    console.log(`getRootNodeFromTLD(${testTLD}) => `, rootNode);
    console.log(`getNodeFromDomain(${theDomainName}, ${testTLD}) => `, testDomain);

    // const TIME_AFTER_SOFT_LAUNCH = 80 * 7 * 24 * 60 * 60;
    // const TIME_DELTA = 2 * 24 * 60 * 60 + 1;
    const TIME_AFTER_SOFT_LAUNCH = 20;
    const TIME_DELTA = 2 * 60 + 1;

    await sendRpc('evm_increaseTime', [TIME_AFTER_SOFT_LAUNCH]);

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

    console.log(await sendRpc('evm_increaseTime', [TIME_DELTA]));

    const nodeEntryBeforeSealBid = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryBeforeSealBid.toString(), '1', 'Bad nodeEntryBeforeSealBid');

    // Place the bid (the real bid is 1 ETH but is concealed as 2 ETH)
    const sealedBid = await registrar.shaBid(testDomain.sha3, initialDomainOwner, web3.toWei(1, 'ether'), web3.sha3('secret'));
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

    console.log(await sendRpc('evm_increaseTime', [TIME_DELTA]));

    const nodeEntryBeforeUnsealBid = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryBeforeUnsealBid.toString(), '4', 'Bad nodeEntryBeforeUnsealBid');

    const unsealBidResult = await registrar.unsealBid(testDomain.sha3, web3.toWei(1, 'ether'), web3.sha3('secret'), {
        from: initialDomainOwner,
        gas: 500000
    });
    console.log('unsealBidResult => ', unsealBidResult, unsealBidResult.receipt.logs[0], unsealBidResult.logs[0].args);

    const nodeEntryAfterUnsealBid = (await registrar.entries(testDomain.sha3))[0];
    assert.strictEqual(nodeEntryAfterUnsealBid.toString(), '4', 'Bad nodeEntryAfterUnsealBid');

    //////// Move 2 days and finalize the auction ////////

    console.log(await sendRpc('evm_increaseTime', [TIME_DELTA]));

    // TODO: deedContract.at(registrar.entries(web3.sha3('name'))[1]).owner();
    // TODO: web3.fromWei(registrar.entries(web3.sha3('name'))[4], 'ether');

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

        const { theDeed } = await createDomainName(assert, Deed, theDomainName, testTLD, ens, registrar, initialDomainOwner);

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
