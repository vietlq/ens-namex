var DirectListing = artifacts.require('./DirectListing');
var Registrar = artifacts.require('./Registrar');
var ENS = artifacts.require('./ENSRegistry');

contract('DirectListing', function (accounts) {

    it('Offer', async () => {
        const ens = await ENS.new();
        const registrar = await Registrar.new(ens.address, 0, 0);
        const contract = await DirectListing.new(registrar.address);

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
