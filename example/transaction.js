const { Transaction } = require('../src/transaction');
const { Buffer } = require('buffer');

try {
    // We sign the transaction with this private key
    const privateKey = Buffer.from(
        'abd1374002952e5f3b60fd16293d06521e1557d9dfb9996561568423a26a9cc9',
        'hex',
    );
    // const tx = new Transaction({
    //     type: 0,
    //     nonce: 1,
    //     gasPrice: 100,
    //     gasLimit: 200000000,
    //     value: 1,
    //     to : '0x160A2189e10Ec349e176d8Fa6Fccf4a19ED6d133',
    // }, 'testnet');
    //
    // tx.sign(privateKey);


    const txData = {
        type: '0x00',
        nonce: '0x01',
        gasPrice: '0x64',
        gasLimit: '0xbebc200',
        to: '0x160a2189e10ec349e176d8fa6fccf4a19ed6d133',
        value: '0x1',
        data: '0x',
        v: '0x1b40e26',
        r: '0xee6c7cc7775bba28c54c4f399272d2fe1de433f696c477b92922166ea9cf4962',
        s: '0x35a20224bd2db92dd5164b83d5371d3a97d00d8ce19b6e56c91afcb8b90dcf7d',
    };

    const tx = new Transaction(txData, 'testnet');

    console.log("Transasion JSON: " + JSON.stringify(tx.toJSON(true)));
    console.log("Transasion rplEncode: " + tx.serialize().toString('hex'));
    console.log('Transaction Hash: ' + tx.hash().toString('hex'));
    console.log("Sender", tx.getSenderAddress().toString('hex'));
    console.log('Senders ChainId: ' + tx.getChainId());
}catch (e) {
    console.log(e)
};
