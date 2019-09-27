const { Transaction } = require('../src/transaction');
const { Buffer } = require('buffer');

try {
    // We sign the transaction with this private key
    const privateKey = Buffer.from(
        'abd1374002952e5f3b60fd16293d06521e1557d9dfb9996561568423a26a9cc9',
        'hex',
    );

    const txData = {
        type: '0x00',
        nonce: '0x01',
        gasPrice: '0x64',
        gasLimit: '0xbebc200',
        to: '0x160a2189e10ec349e176d8fa6fccf4a19ed6d133',
        value: '0x1',
        data: '0x',
        v: '0x1b40e25',
        r: '0x7c91493ca956ccd46cb4b4960244a6e062f71a874157d6191315e40a0e2417d1',
        s: '0x928a8e437c8a37e9280d81601e41e1573e04ebb4fc7fc245913c54613e33073',
    };
    const tx = new Transaction(txData, 'testnet');
    console.log("Transasion JSON: " + JSON.stringify(tx.toJSON(true)));
    console.log("Transasion rplEncode: " + tx.serialize().toString('hex'));
    console.log('Transaction Hash: ' + tx.hash().toString('hex'));
    console.log("Sender", tx.getSenderAddress().toString('hex')); // 160a2189e10ec349e176d8fa6fccf4a19ed6d133
    console.log('Senders ChainId: ' + tx.getChainId());
}catch (e) {
    console.log(e)
};
