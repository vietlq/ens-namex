var DirectListing = artifacts.require('./DirectListing');
var Registrar = artifacts.require('@ensdomains/ens/contracts/Registrar');
var ENS = artifacts.require('@ensdomains/ens/contracts/ENSRegistry');

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

contract('DirectListing', function (accounts) {

    it('Offer', async () => {
        const ens = await ENS.new();


        const registrar = await Registrar.new(ens.address, web3.sha3('eth'), 0);


        await ens.setSubnodeOwner(0, web3.sha3('eth'), registrar.address);
        const contract = await DirectListing.new(registrar.address);

        const TIME_80_WEEKS = 80 * 7 * 24 * 60 * 60;
        const TIME_5_DAYS = 5 * 24 * 60 * 60 + 1;
        await sendRpc('evm_increaseTime', [TIME_80_WEEKS]);

        const node = web3.sha3('testingname');
        const nodeEntryBeforeAuction = (await registrar.entries(node))[0];
        const price = 10;

        assert(nodeEntryBeforeAuction.toString() === '0');

        await registrar.startAuction(node, {
            from: accounts[0],
            gas: 100000
        });

        const nodeEntryAfterAuction = (await registrar.entries(node))[0];

        assert(nodeEntryBeforeAuction.toString() === '1');

        await sendRpc('evm_increaseTime', [TIME_5_DAYS]);

        assert(nodeEntryAfterAuction.toString() === '4');


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
        //     assert.equal(result.args.node, node, 'Should have matched the matched label node');
        // });

        // const p2 = contract.offer(node, price, 10, {
        //     from: accounts[0]
        // });

        // return Promise.all([p1, p2]);
    });
});
