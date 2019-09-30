const { Transaction } = require('../src/transaction');

const privateKey = Buffer.from(
    'abd1374002952e5f3b60fd16293d06521e1557d9dfb9996561568423a26a9cc9',
    'hex',
);

const testData = [
    {
        tx : {
            type: '0x00',
            nonce: '0x00',
            gasPrice: '0x09184e72a000',
            gasLimit: '0x2710',
            to: '0x0000000000000000000000000000000000000000',
            value: '0x00',
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        },
        result : {
            hash : '4408520855374c21491a11ddfe88fcb461449c33c043c8b9e938773466a87553',
            sender : '160a2189e10ec349e176d8fa6fccf4a19ed6d133'
        }
    },
    {
        tx : {
            type: 0,
            nonce: 0,
            gasPrice: 10000000000000,
            gasLimit: 10000,
            to: '0x0000000000000000000000000000000000000000',
            value: '0x00',
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        },
        result : {
            hash : '4408520855374c21491a11ddfe88fcb461449c33c043c8b9e938773466a87553',
            sender : '160a2189e10ec349e176d8fa6fccf4a19ed6d133'
        }
    },
    {
        tx : [
            '0x00',
            '0x00',
            '0x09184e72a000',
            '0x2710',
            '0x0000000000000000000000000000000000000000',
            '0x00',
            '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
        ],
        result : {
            hash : '4408520855374c21491a11ddfe88fcb461449c33c043c8b9e938773466a87553',
            sender : '160a2189e10ec349e176d8fa6fccf4a19ed6d133'
        }
    }
];

test('Make Transaction test', done => {
    try {
        for (let i in testData) {
            const tx = new Transaction(testData[i].tx, 'testnet');
            tx.sign(privateKey);
            expect(tx.getSenderAddress().toString('hex')).toBe(testData[i].result.sender);
            expect(tx.hash().toString('hex')).toBe(testData[i].result.hash);
        }
        done()
    }catch (e) {
        done.fail(e)
    }
});
