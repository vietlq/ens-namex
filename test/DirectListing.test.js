var DirectListing = artifacts.require('../contracts/DirectListing.sol');

contract('DirectListing', function (accounts) {

    it('Offer', () => {
        return DirectListing.new(0x0).then((contract) => {
            const event = contract.Offered({
                _from: accounts[0]
            }, {
                fromBlock: 0,
                toBlock: 'latest'
            });

            const price = 10;
            const node = '0x0123';

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
});
