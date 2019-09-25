const { chains:chainParams } = require('./chains');

function Common(chain) {
    if (!(this instanceof Common)) throw new Error("Common must be called instance.");
    this._chainParams = this.setChain(chain)
}

Common.prototype.genesis = () => this._chainParams['genesis'];
Common.prototype.chainId = () => this._chainParams['chainId'];
Common.prototype.chainName = () => this._chainParams['name'];
Common.prototype.networkId = () => this._chainParams['networkId'];
Common.prototype.setChain = (chain) => {
    if (typeof chain === 'number' || typeof chain === 'string') {
        this._chainParams = Common._getChainParams(chain)
    } else {
        throw new Error('Wrong input format')
    }
    return this._chainParams
};
Common.prototype.param = (topic, name) => {
    let value;
    for (const hfChanges of hardforkChanges) {
        if (!hfChanges[1][topic]) {
            throw new Error(`Topic ${topic} not defined`)
        }
        if (hfChanges[1][topic][name] !== undefined) {
            value = hfChanges[1][topic][name].v
        }
        if (hfChanges[0] === hardfork) break
    }
    if (value === undefined) {
        throw new Error(`${topic} value for ${name} not found`)
    }
    return value
};
Common._getChainParams = (chain) => {
    if (Number.isInteger(chain)) {
        if (chainParams['names'][chain]) {
            return chainParams[chainParams['names'][chain]]
        }
        throw new Error(`Chain with ID ${chain} not supported`)
    }
    if (chainParams[chain]) {
        return chainParams[chain]
    }
    throw new Error(`Chain with name ${chain} not supported`)
};

module.exports = Common;
