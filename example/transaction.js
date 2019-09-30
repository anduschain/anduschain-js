const { Transaction } = require('../src/transaction');
const { Buffer } = require('buffer');

try {
    // We sign the transaction with this private key
    const privateKey = Buffer.from(
        'abd1374002952e5f3b60fd16293d06521e1557d9dfb9996561568423a26a9cc9',
        'hex',
    );
    const txData = {
        nonce: 0,
        to: '0x160a2189e10ec349e176d8fa6fccf4a19ed6d133',
        value: '0x1',
        data: '0x',
    };
    const tx = new Transaction(txData, 'testnet');
    tx.sign(privateKey);
    console.log("Transasion JSON: " + JSON.stringify(tx.toJSON(true)));
    console.log("Transasion rplEncode: " + tx.serialize().toString('hex'));
    console.log('Transaction Hash: ' + tx.hash().toString('hex'));
    console.log("Sender", tx.getSenderAddress().toString('hex')); // 160a2189e10ec349e176d8fa6fccf4a19ed6d133
    console.log('Senders ChainId: ' + tx.getChainId());
    console.log("Fee ", tx.getUpfrontCost().toString());
}catch (e) {
    console.log(e)
};
