'use strict';

const Entity = require('./entity');
const Token = require('./token');

const {assignTypes} = require('../common/util');

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
        if (!data) {
            return;
        }
        let firstToken;
        let previousToken;
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
            if (!firstToken) {
                firstToken = token;
            }
            if (previousToken) {
                token.link('prev', previousToken);
                previousToken.link('next', token);
            }
            previousToken = token;
            return token;
        });
        tokens.forEach((token) => {
            token.link('first', firstToken);
            token.link('last', previousToken);
        });
    }

    output() {
        return 'Thx';
    }
}

module.exports = Model;
