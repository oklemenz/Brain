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
        this.minLinks = 0;
        this.maxLinks = 0;
        this.avgLinks = 0;
        this.stdDevLinks = 0;
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
            //this.forget();
        }, options.forgetInterval);
        this.calcMaxLinks();
    }

    store() {
        return JSON.stringify(this, null, 2);
    }

    calcMaxLinks() {
        const data = Object.keys(this.tokens).map((tokenName) => {
            return this.tokens[tokenName].linkCount();
        });
        this.minLinks = Math.min(...data);
        this.maxLinks = Math.max(...data);
        this.avgLinks = options.average(data);
        this.stdDevLinks = options.standardDeviation(data);
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
            let token = this.token(tokenName);
            // Reserved JS keyword?
            if (token && token.constructor.name !== 'Token') {
                tokenName = ' ' + tokenName;
                token = this.token(tokenName);
            }
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
                this.wait();
            }, options.contextInterval);
        }
        this.calcMaxLinks();
        return true;
    }

    output() {
        if (beforeInputTokens && beforeInputTokens.length > 0) {

            // 1. Find significant tokens in before input
            const significantTokens = beforeInputTokens.filter((token) => {
                return token.isSignificant();
            });
            significantTokens.sort((a, b) => {
                return a.weight - b.weight;
            });

            // 2. Spread token to significant weighted tokens
            const significantWeightedSpreadTokens = {};
            significantTokens.forEach((token) => {
                this.traverse(token, options.spreadTraverse, significantWeightedSpreadTokens);
            });
            let significantWeightedSpreadTokenList = [];
            Object.keys(significantWeightedSpreadTokens).forEach((tokenName) => {
                const key = significantWeightedSpreadTokens[tokenName];
                significantWeightedSpreadTokenList[key] = significantWeightedSpreadTokenList[key] || [];
                significantWeightedSpreadTokenList[key].push(tokenName);
            });
            let significantWeightedSpreadTokenSelect = [];
            Object.keys(significantWeightedSpreadTokenList).reverse().slice(0, options.spreadSelect).forEach((weight) => {
                significantWeightedSpreadTokenSelect.push(...significantWeightedSpreadTokenList[weight]);
            });

            // 3. Determine start select tokens to significant spread weighted tokens
            const significantWeightedSpreadStartTokens = {};
            significantWeightedSpreadTokenSelect.forEach((tokenName) => {
                const startTokens = this.tokens[tokenName].getLinks('start').map((link) => {
                    return link.to;
                });
                startTokens.forEach((startToken) => {
                    significantWeightedSpreadStartTokens[startToken] = significantWeightedSpreadStartTokens[startToken] || [];
                    significantWeightedSpreadStartTokens[startToken].push(tokenName);
                });
            });

            // 4. Find output tokens from start token to end token via optimal link width
            const outputTokenOptions = []; // [{startToken, tokens, weight}]
            function determineOutputToken(currentToken, outputTokens = []) {
                const maxWeightLink = currentToken.getMaxWeightLink();
                significantTokens.forEach((significantToken) => {
                    if (currentToken.hasLinkForToToken(significantToken)) {

                    }
                })
            }
            Object.keys(significantWeightedSpreadStartTokens).forEach((startTokenName) => {
                determineOutputToken(this.tokens[startTokenName]);
            });
            const outputTokenOption = outputTokenOptions.reduce((maxOutputTokenOption, outputTokenOption) => {
                if (!outputTokenOption || outputTokenOption.weight > maxOutputTokenOption.weight) {
                    maxOutputTokenOption = outputTokenOption;
                }
                return maxOutputTokenOption;
            }, undefined);

            // 5. Produce token output from start token to end token
            if (outputTokenOption) {
                return outputTokenOption.tokens.map((token) => {
                    return token.name.trim();
                }).join(' ');
            }

            // 6. Use after token of start token to add additional output...
        }
        return 'Hm';
    }

    traverse(token, count, result = {}) {
        if (count < 0) {
            return result;
        }
        if (!token.isSignificant()) {
            return result;
        }
        result[token.name] = result[token.name] || 0;
        result[token.name] += token.weight;
        token.links.forEach((link) => {
            if (link.name === 'next') {
                result[token.name] += link.weight;
                const toToken = link.toToken();
                if (toToken) {
                    this.traverse(toToken, count - 1, result);
                }
            }
        });
        return result;
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
        // Restructure and cleanup tokens and links
    }

    wake() {
        this.sleeping = false;
        if (sleepInterval) {
            sleepInterval.clearInterval();
        }
    }

    wait() {
        beforeInputTokens = [];
        beforeStartToken = undefined;
        beforeStartTokenTimeout = undefined;
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
