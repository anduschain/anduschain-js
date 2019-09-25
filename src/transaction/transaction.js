const {
    BN,
    defineProperties,
    bufferToInt,
    ecrecover,
    rlphash,
    publicToAddress,
    ecsign,
    toBuffer,
    rlp,
    stripZeros,
} = require('ethereumjs-util');
const { Buffer } = require('buffer');
const Common = require('../common');

// Define Properties
const fields = [
    {
        name: 'type',
        length: 32,
        allowLess: true,
        default: Buffer.from([]),
    },
    {
        name: 'nonce',
        length: 32,
        allowLess: true,
        default: Buffer.from([]),
    },
    {
        name: 'gasPrice',
        length: 32,
        allowLess: true,
        default: Buffer.from([]),
    },
    {
        name: 'gasLimit',
        alias: 'gas',
        length: 32,
        allowLess: true,
        default: Buffer.from([]),
    },
    {
        name: 'to',
        allowZero: true,
        length: 20,
        default: Buffer.from([]),
    },
    {
        name: 'value',
        length: 32,
        allowLess: true,
        default: Buffer.from([]),
    },
    {
        name: 'data',
        alias: 'input',
        allowZero: true,
        default: Buffer.from([]),
    },
    {
        name: 'v',
        allowZero: true,
        default: Buffer.from([]),
    },
    {
        name: 'r',
        length: 32,
        allowZero: true,
        allowLess: true,
        default: Buffer.from([]),
    },
    {
        name: 's',
        length: 32,
        allowZero: true,
        allowLess: true,
        default: Buffer.from([]),
    },
];

// secp256k1n/2
const N_DIV_2 = new BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16);

function Transaction(data, chain) {
    if (!(this instanceof Transaction)) throw new Error("Transaction must be called instance.");
    this.raw = undefined;
    this.nonce = undefined;
    this.gasLimit = undefined;
    this.gasPrice = undefined;
    this.to = undefined;
    this.value = undefined;
    this.data = undefined;
    this.v = undefined;
    this.r = undefined;
    this.s = undefined;

    this._senderPubKey = undefined;
    this._from = undefined;
    this._common = new Common(chain);

    defineProperties(this, fields, data);
    /**
     * @property {Buffer} from (read only) sender address of this transaction, mathematically derived from other parameters.
     * @name from
     * @memberof Transaction
     */
    Object.defineProperty(this, 'from', {
        enumerable: true,
        configurable: true,
        get: this.getSenderAddress.bind(this),
    });

    this._validateV(this.v);
    this._overrideVSetterWithValidation();

    console.log("---------------------", this)
}
Transaction.prototype.hash = (includeSignature) => {
    let items;
    if (includeSignature) {
        items = this.raw
    } else {
        if (this._implementsEIP155()) {
            items = [
                ...this.raw.slice(0, 6),
                toBuffer(this.getChainId()),
                // TODO: stripping zeros should probably be a responsibility of the rlp module
                stripZeros(toBuffer(0)),
                stripZeros(toBuffer(0)),
            ]
        } else {
            items = this.raw.slice(0, 6)
        }
    }
    // create hash
    return rlphash(items)
};
Transaction.prototype.getChainId = () => {
    return 14288641
};
Transaction.prototype.getSenderAddress = () => {
    if (this._from) {
        return this._from
    }
    const pubkey = this.getSenderPublicKey()
    this._from = publicToAddress(pubkey)
    return this._from
};
Transaction.prototype.getSenderPublicKey = () => {
    if (!this.verifySignature()) {
        throw new Error('Invalid Signature')
    }

    // If the signature was verified successfully the _senderPubKey field is defined
    return this._senderPubKey
};
Transaction.prototype.verifySignature = () => {
    const msgHash = this.hash(false);
    // All transaction signatures whose s-value is greater than secp256k1n/2 are considered invalid.
    // if (this._common.gteHardfork('homestead') && new BN(this.s).cmp(N_DIV_2) === 1) {
    //     return false
    // }
    try {
        const v = bufferToInt(this.v);
        const useChainIdWhileRecoveringPubKey = v >= this.getChainId() * 2 + 35;
        this._senderPubKey = ecrecover(
            msgHash,
            v,
            this.r,
            this.s,
            useChainIdWhileRecoveringPubKey ? this.getChainId() : undefined,
        )
    } catch (e) {
        return false
    }

    return !!this._senderPubKey
};
Transaction.prototype.sign = () => {
    this.v = Buffer.from([]);
    this.s = Buffer.from([]);
    this.r = Buffer.from([]);
    const msgHash = this.hash(false);
    const sig = ecsign(msgHash, privateKey);
    if (this._implementsEIP155()) {
        sig.v += this.getChainId() * 2 + 8
    }
    Object.assign(this, sig)
};
Transaction.prototype.getDataFee = () => {
    const data = this.raw[5];
    const cost = new BN(0);
    for (let i = 0; i < data.length; i++) {
        data[i] === 0
            ? cost.iaddn(this._common.param('gasPrices', 'txDataZero'))
            : cost.iaddn(this._common.param('gasPrices', 'txDataNonZero'))
    }
    return cost
};
Transaction.prototype.getBaseFee = () => {
    const fee = this.getDataFee().iaddn(this._common.param('gasPrices', 'tx'))
    if (this._common.getHardfork('homestead') && this.toCreationAddress()) {
        fee.iaddn(this._common.param('gasPrices', 'txCreation'))
    }
    return fee
};
Transaction.prototype.getUpfrontCost = () => {
    return new BN(this.gasLimit).imul(new BN(this.gasPrice)).iadd(new BN(this.value))
};
Transaction.prototype._validateV = (v) => {
    if (v === undefined || v.length === 0 || !Buffer.isBuffer(v)) {
        return
    }
    const vInt = bufferToInt(v);
    if (vInt === 27 || vInt === 28) {
        return
    }
    const isValidEIP155V =
        vInt === this.getChainId() * 2 + 35 || vInt === this.getChainId() * 2 + 36

    if (!isValidEIP155V) {
        throw new Error(
            `Incompatible EIP155-based V ${vInt} and chain id ${this.getChainId()}. See the second parameter of the Transaction constructor to set the chain id.`,
        )
    }
};
Transaction.prototype._overrideVSetterWithValidation = () => {
    const vDescriptor = Object.getOwnPropertyDescriptor(this, 'v');
    Object.defineProperty(this, 'v', {
        ...vDescriptor,
        set: v => {
            if (v !== undefined) {
                this._validateV(toBuffer(v))
            }
            vDescriptor.set(v)
        },
    })
};
Transaction.prototype.serialize = () => rlp.encode(this.raw);
Transaction.prototype._isSigned = () => this.v.length > 0 && this.r.length > 0 && this.s.length > 0;
Transaction.prototype._implementsEIP155 = () => {
    if (!this._isSigned()) {
        // We sign with EIP155 all unsigned transactions after spuriousDragon
        return false
    }

    // EIP155 spec:
    // If block.number >= 2,675,000 and v = CHAIN_ID * 2 + 35 or v = CHAIN_ID * 2 + 36, then when computing
    // the hash of a transaction for purposes of signing or recovering, instead of hashing only the first six
    // elements (i.e. nonce, gasprice, startgas, to, value, data), hash nine elements, with v replaced by
    // CHAIN_ID, r = 0 and s = 0.
    const v = bufferToInt(this.v);
    return v === this.getChainId() * 2 + 35 || v === this.getChainId() * 2 + 36;
};

module.exports = Transaction;
