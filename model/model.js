'use strict';

const Entity = require('./entity');
const Token = require('./token');

const options = require('../common/util');
const {enrichData} = require('../common/util');

let beforeInputTokens = [];
let beforeStartToken;
let beforeStartTokenTimeout;

let sleepInterval;
let forgetInterval;

class Model extends Entity {

    constructor() {
        super('Model');
    }

    init() {
        super.init();
        this.tokens = {};
        this.sleeping = false;
    }

    reset() {
        this.init();
    }

    load(data) {
        this.init();
        Object.assign(this, enrichData(this, JSON.parse(data)));
        if (forgetInterval) {
            forgetInterval.clearInterval();
        }
        forgetInterval = setInterval(() => {
            this.forget();
        }, options.forgetInterval);
    }

    store() {
        return JSON.stringify(this, null, 2);
    }

    token(tokenName) {
        return this.tokens[tokenName];
    }

    input(data) {
        if (this.sleeping) {
            return false;
        }
        this.touch();
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
                token[global.model.Symbols.Root] = this;
                token[global.model.Symbols.Parent] = this;
                this.tokens[tokenName] = token;
            }
            token.touch();

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
        return true;
    }

    output() {
        if (beforeInputTokens) {
            // TODO: Produce output based on input before
            //  - Find tokens with hot spot ratio
            //  - Find start for hot spot tokens
            //  - ...
            return 'Aha';
        }
        return 'Aha';
    }

    sleep() {
        if (!this.sleeping) {
            this.sleeping = true;
            sleepInterval = setInterval(() => {
                this.dream();
            }, options.sleepInterval);
        }
    }

    dream() {
        // TODO: Restructure and cleanup
    }

    wake() {
        this.sleeping = false;
        if (sleepInterval) {
            sleepInterval.clearInterval();
        }
    }

    forget() {
        Object.keys(this.tokens).forEach((tokenName) => {
            const token = this.token(tokenName);
            if (Math.random() < options.forgetProbability) {
                if (token.forget()) {
                    delete this.tokens[tokenName];
                    return;
                }
            }
            [...token.links].forEach((link) => {
                if (Math.random() < options.forgetProbability) {
                    if (link.forget()) {
                        const index = token.links.indexOf(link);
                        token.links.splice(index, 1);
                    }
                }
            });
        });
    }
}

module.exports = Model;
