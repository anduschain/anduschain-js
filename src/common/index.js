const { chains:chainParams } = require('./chains');
const { hardforks:hardforkChanges } = require('./hardforks');

function Common(chain, hardfork, supportedHardforks) {
    if (!(this instanceof Common)) throw new Error("Common must be called instance.");
    this._chainParams = this.setChain(chain);
    this._hardfork = null;
    this._supportedHardforks = supportedHardforks === undefined ? [] : supportedHardforks
    if (hardfork) {
        this.setHardfork(hardfork)
    }
}

Common.prototype.setHardfork = (hardfork) => {
    if (!this._isSupportedHardfork(hardfork)) {
        throw new Error(`Hardfork ${hardfork} not set as supported in supportedHardforks`)
    }
    let changed = false;
    for (const hfChanges of hardforkChanges) {
        if (hfChanges[0] === hardfork) {
            this._hardfork = hardfork;
            changed = true
        }
    }
    if (!changed) {
        throw new Error(`Hardfork with name ${hardfork} not supported`)
    }
};
Common.prototype._isSupportedHardfork = (hardfork) => {
    if (this._supportedHardforks.length > 0) {
        for (const supportedHf of this._supportedHardforks) {
            if (hardfork === supportedHf) return true
        }
    } else {
        return true
    }
    return false
};
Common.prototype.hardforks = () => this._chainParams['hardforks'];
Common.prototype.getHardfork = (hardfork) => {
    const hfs = this.hardforks();
    for (const hf of hfs) {
        if (hf['name'] === hardfork) return hf
    }
    throw new Error(`Hardfork ${hardfork} not defined for chain ${this.chainName()}`)
};
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
Common.prototype._chooseHardfork = (hardfork, onlySupported) => {
    onlySupported = onlySupported === undefined ? true : onlySupported;
    if (!hardfork) {
        if (!this._hardfork) {
            throw new Error('Method called with neither a hardfork set nor provided by param')
        } else {
            hardfork = this._hardfork
        }
    } else if (onlySupported && !this._isSupportedHardfork(hardfork)) {
        throw new Error(`Hardfork ${hardfork} not set as supported in supportedHardforks`)
    }
    return hardfork
};
Common.prototype.param = (topic, name) => {
    hardfork = this._chooseHardfork(hardfork);
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
