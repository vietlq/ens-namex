const HDWalletProvider = require("truffle-hdwallet-provider");
const privateJson = require('./.private.json');

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*'
        },
        [privateJson.name]: {
            provider: () => new HDWalletProvider(privateJson.mnemonic, privateJson.endpoint, 0),
            from: privateJson.address,
            network_id: privateJson.network_id
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    mocha: {
        useColors: true
    }
};
