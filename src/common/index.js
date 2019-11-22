const { chains:chainParams } = require('./chains');
const hardforkChanges = require('./hardforks');

function Common(chain, hardfork) {
    if (!(this instanceof Common)) throw new Error("Common must be called instance.");
    this._chainParams = this.setChain(chain);
    this._hardfork = null;
    this._supportedHardforks = [];
    if (hardfork) {
        this.setHardfork(hardfork)
    }
}

Common.prototype.setHardfork = function (hardfork) {
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
Common.prototype._isSupportedHardfork = function (hardfork) {
    if (this._supportedHardforks.length > 0) {
        for (const supportedHf of this._supportedHardforks) {
            if (hardfork === supportedHf) return true
        }
    } else {
        return true
    }
    return false
};
Common.prototype.hardforks = function () {
    return this._chainParams['hardforks'];
};
Common.prototype.getHardfork = function (hardfork) {
    const hfs = this.hardforks();
    for (const hf of hfs) {
        if (hf['name'] === hardfork) return hf
    }
    throw new Error(`Hardfork ${hardfork} not defined for chain ${this.chainName()}`)
};
Common.prototype.genesis = function() {
    return this._chainParams['genesis'];
};
Common.prototype.chainId = function() {
    return this._chainParams['chainId'];
};
Common.prototype.chainName = function(){
    return this._chainParams['name'];
};
Common.prototype.networkId = function(){
    return this._chainParams['networkId'];
};
Common.prototype.setChain = function(chain) {
    if (typeof chain === 'number' || typeof chain === 'string') {
        this._chainParams = Common._getChainParams(chain)
    } else {
        throw new Error('Wrong input format')
    }
    return this._chainParams
};
Common.prototype._chooseHardfork = function(hardfork, onlySupported) {
    let onlySupp = onlySupported ? onlySupported : true;
    if (!hardfork) {
        if (!this._hardfork) {
            throw new Error('Method called with neither a hardfork set nor provided by param')
        } else {
            hardfork = this._hardfork
        }
    } else if (onlySupp && !this._isSupportedHardfork(hardfork)) {
        throw new Error(`Hardfork ${hardfork} not set as supported in supportedHardforks`)
    }
    return hardfork
};
Common.prototype.param = function(topic, name, hardfork) {
    let value, fork;
    if (hardfork) {
        fork = this._chooseHardfork(hardfork);
    }
    for (const hfChanges of hardforkChanges) {
        if (!hfChanges[1][topic]) {
            throw new Error(`Topic ${topic} not defined`)
        }
        if (hfChanges[1][topic][name] !== undefined) {
            value = hfChanges[1][topic][name].v;
        }
        if (hfChanges[0] === fork) break
    }
    if (value === undefined) {
        throw new Error(`${topic} value for ${name} not found`)
    }
    return value
};
Common._getChainParams = function(chain) {
    /**
     * @Params chain -> Number(chain) or "testnet", mainnet
     * */
    if (Number.isInteger(chain)) {
        if (chainParams['names'][chain]) {
            return chainParams[chainParams['names'][chain]]
        }else{
            return chainParams.custom(`Private_${chain}`, chain)
        }
    }else{
        if (chainParams[chain]) {
            return chainParams[chain]
        }
        throw new Error(`This chainID ${chain} is not Support`)
    }
};

module.exports = Common;
