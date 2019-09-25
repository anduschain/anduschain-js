const Common = require('../src/common');

test('common get chain params number', done => {
    try {
        let params = Common._getChainParams(14288641);
        expect(params.name).toBe('testnet');
        done();
    }catch (e) {
        done.fail(e)
    }
});

test('common get chain params string', done => {
    try {
        let params = Common._getChainParams('testnet');
        expect(params.name).toBe('testnet');
        done();
    }catch (e) {
        done.fail(e)
    }
});
