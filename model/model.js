'use strict';

const Entity = require('./entity');
const Token = require('./token');

const {assignTypes} = require('../common/util');

let beforeInputTokens = [];
let beforeStartToken;
let beforeStartTokenTimeout;

class Model extends Entity {

    constructor() {
        super('Model');
        this.init();
    }

    init() {
        this.tokens = {};
    }

    reset() {
        this.init();
    }

    load(data) {
        this.init();
        Object.assign(this, assignTypes(JSON.parse(data)));
    }

    store() {
        return JSON.stringify(this, null, 2);
    }

    input(data) {
        let startToken;
        let prevToken;
        const tokenNames = data
            .replace(/[^\w\s?]/gi, '')
            .replace(/\?/gi, ' ?')
            .split(/[\s]+/);
        const tokens = tokenNames.map((tokenName) => {
            tokenName = tokenName.toLowerCase();
            let token = this.tokens[tokenName];
            if (!token) {
                token = new Token(tokenName);
                this.tokens[tokenName] = token;
            }
            token.count++;
            if (!startToken) {
                startToken = token;
            }
            if (prevToken) {
                token.link('prev', prevToken);
                prevToken.link('next', token);
            }
            prevToken = token;
            return token;
        });
        tokens.forEach((token) => {
            token.link('start', startToken);
            token.link('end', prevToken);
        });

        if (startToken) {
            if (beforeStartToken) {
                startToken.link('before', beforeStartToken);
                beforeStartToken.link('after', startToken);
            }
            beforeInputTokens = tokens;
            beforeStartToken = startToken;
            if (beforeStartTokenTimeout) {
                clearTimeout(beforeStartTokenTimeout);
            }
            beforeStartTokenTimeout = setTimeout(() => {
                beforeInputTokens = [];
                beforeStartToken = undefined;
                beforeStartTokenTimeout = undefined;
            }, 60 * 1000);
        }
    }

    output() {
        if (beforeInputTokens) {
            // TODO:
            //  - For each before input token
            //  -
            return 'Thx';
        }
        // TODO: Find hot spots in brain, build output from inputs
        return 'Thx';
    }
}

module.exports = Model;
