const Custom = function (name, chainId) {
    if (!(typeof name === 'string' && typeof chainId === 'number')) {
        throw new Error(`check parameter type, chain id ${chainId}, name ${name}`)
    }
    return {
        "name": name,
        "chainId": chainId,
        "networkId": chainId,
        "comment": "The anduschain private network",
        "url": "https://localhost/",
        "genesis": {
            "hash": "0xadb0929649cdd519ec76725c46d4d2346d846ac49d6631d718d0ca287ce40431",
            "timestamp": null,
            "gasLimit": 4700000,
            "difficulty": 1,
            "nonce": "0x0000000000000000",
            "extraData": "0x616e647573636861696e2d746573746e65742d3134323838363431",
            "stateRoot": "0x71a20effe95f0047c042a439d500a9ea309df1bdd253a20dda7070e935abecd2"
        },
        "hardforks": [
            {
                "name": "chainstart",
                "block": 0,
                "consensus": "deb",
                "finality": null
            },
            {
                "name": "homestead",
                "block": 0,
                "consensus": "deb",
                "finality": null
            },
            {
                "name": "dao",
                "block": 0,
                "consensus": "deb",
                "finality": null
            },
            {
                "name": "byzantium",
                "block": 0,
                "consensus": "deb",
                "finality": null
            },
            {
                "name": "constantinople",
                "block": 0,
                "consensus": "deb",
                "finality": null
            }
        ],
        "bootstrapNodes": []
    };
}

module.exports = Custom;
