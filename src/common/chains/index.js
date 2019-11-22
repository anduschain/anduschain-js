// return chain conifg genesis
const custom = require("./custom");

module.exports = {
    chains : {
        names: {
            14288641 : 'testnet',
        },
        testnet: require('./testnet.json'),
        custom : custom,
    }
};
