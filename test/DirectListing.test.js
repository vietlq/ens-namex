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
        const registrar = await Registrar.new(ens.address, 0, 0);
        const contract = await DirectListing.new(registrar.address);

        console.log('web3 => ', web3);
        console.log(web3);
        const TIME_80_WEEKS = 80*7*24*60*60;
        const advance80weeksResult = await sendRpc('evm_increaseTime', [TIME_80_WEEKS]);
        assert(advance80weeksResult.result == TIME_80_WEEKS);

        const event = contract.Offered({
            _from: accounts[0]
        }, {
            fromBlock: 0,
            toBlock: 'latest'
        });

        const price = 10;
        const node = '0x0123000000000000000000000000000000000000000000000000000000000000';

        const p1 = new Promise((resolve, reject) => {
            event.watch((error, result) => {
                if (error) return reject(error);

                resolve(result);
            });
        }).then((result) => {
            assert.equal(result.args.owner, accounts[0], 'Should have matched the creator');
            assert.equal(result.args.price, price, 'Should have matched the offered price');
            assert.equal(result.args.node, node, 'Should have matched the matched label node');
        });

        const p2 = contract.offer(node, price, 10, {
            from: accounts[0]
        });

        return Promise.all([p1, p2]);
    });
});
