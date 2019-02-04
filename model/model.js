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
        this.minWeight = 0;
        this.maxWeight = 0;
        this.avgWeight = 0;
        this.stdDevWeight = 0;
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
        const linkCount = Object.keys(this.tokens).map((tokenName) => {
            return this.tokens[tokenName].linkCount();
        });
        this.minLinks = Math.min(...linkCount);
        this.maxLinks = Math.max(...linkCount);
        this.avgLinks = options.average(linkCount);
        this.stdDevLinks = options.standardDeviation(linkCount);
        const linkWeight = Object.keys(this.tokens).map((tokenName) => {
            return this.tokens[tokenName].linkMaxWeight();
        });
        this.minWeight = Math.min(...linkWeight);
        this.maxWeight = Math.max(...linkWeight);
        this.avgWeight = options.average(linkWeight);
        this.stdDevWeight = options.standardDeviation(linkWeight);
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
        const tokens = tokenNames.filter((tokenName) => {
            return tokenName !== '';
        }).map((tokenName) => {
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
            let significantTokens = beforeInputTokens.filter((token) => {
                return token.isSignificant();
            });
            if (significantTokens.length === 0) {
                significantTokens = beforeInputTokens;
            }
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
                const weight = significantWeightedSpreadTokens[tokenName];
                significantWeightedSpreadTokenList[weight] = significantWeightedSpreadTokenList[weight] || [];
                significantWeightedSpreadTokenList[weight].push(tokenName);
            });
            let significantWeightedSpreadTokenSelect = [];
            Object.keys(significantWeightedSpreadTokenList).reverse().slice(0, options.spreadSelect).forEach((weight) => {
                significantWeightedSpreadTokenSelect.push(...significantWeightedSpreadTokenList[weight]);
            });
            significantWeightedSpreadTokenSelect = significantWeightedSpreadTokenSelect.slice(0, options.spreadSelect);
            significantTokens.forEach((significantToken) => {
                if (!significantWeightedSpreadTokenSelect.find((startToken) => {
                    return startToken === significantToken.name;
                })) {
                    significantWeightedSpreadTokenSelect.splice(0, 0, significantToken.name);
                }
            });

            // 3. Determine start select tokens to significant spread weighted token selection
            const significantWeightedSpreadStartTokens = {};
            significantWeightedSpreadTokenSelect.forEach((tokenName) => {
                const token = this.tokens[tokenName];
                const startTokens = this.tokens[tokenName].getLinks('start').map((link) => {
                    return link.to;
                });
                startTokens.forEach((startTokenName) => {
                    significantWeightedSpreadStartTokens[startTokenName] = significantWeightedSpreadStartTokens[startTokenName] || 0;
                    significantWeightedSpreadStartTokens[startTokenName] += token.weight;
                });
            });
            let significantWeightedSpreadStartTokenList = [];
            Object.keys(significantWeightedSpreadStartTokens).forEach((tokenName) => {
                const weight = significantWeightedSpreadStartTokens[tokenName];
                significantWeightedSpreadStartTokenList[weight] = significantWeightedSpreadStartTokenList[weight] || [];
                significantWeightedSpreadStartTokenList[weight].push(tokenName);
            });
            let significantWeightedSpreadStartTokenSelect = [];
            Object.keys(significantWeightedSpreadStartTokenList).reverse().slice(0, options.outputSelect).forEach((weight) => {
                significantWeightedSpreadStartTokenSelect.push(...significantWeightedSpreadStartTokenList[weight]);
            });
            significantWeightedSpreadStartTokenSelect = significantWeightedSpreadStartTokenSelect.slice(0, options.outputSelect);

            // 4. Find output tokens from start token to end token via optimal link weight
            const startTime = Date.now();
            const outputTokenOptions = [];
            const determineOutputToken = (token, outputTokens = [], weight = 0, end = false) => {
                if (Date.now() >= startTime + options.outputCalcDuration) {
                    return;
                }
                if (outputTokens.find((outputToken) => {
                    return outputToken.name === token.name;
                })) {
                    return;
                }
                outputTokens.push(token);
                if (end) {
                    outputTokenOptions.push({
                        tokens: outputTokens,
                        weight: weight
                    });
                } else {
                    let weightPlus = 0;
                    significantTokens.forEach((significantToken) => {
                        significantToken.getLinks('after').forEach((afterLink) => {
                            if (afterLink.isSignificant()) {
                                if (token.name === afterLink.to) {
                                    weightPlus += options.outputAfterWeight;
                                }
                            }
                        });
                    });
                    significantTokens.forEach((significantToken) => {
                        const toTokenLink = token.getLinkForToToken(significantToken);
                        if (toTokenLink) {
                            determineOutputToken(toTokenLink.toToken(),
                                [...outputTokens], weight + options.outputInputWeight + weightPlus, toTokenLink.name === 'end');
                        }
                    });
                    const endTokens = token.getLinkTokens('end');
                    token.getEndLinksWeightOrderDesc().forEach((endLink) => {
                        const toToken = endLink.toToken();
                        const toEndTokens = toToken.getLinkTokens('end');
                        if (toEndTokens.find((toEndToken) => {
                            return endTokens.find((endToken) => {
                                return endToken.name === toEndToken.name;
                            });
                        })) {
                            determineOutputToken(toToken,
                                [...outputTokens], weight + endLink.weight + weightPlus, true);
                        }
                    });
                    token.getNextLinksWeightOrderDesc().forEach((nextLink) => {
                        const toToken = nextLink.toToken();
                        const toEndTokens = toToken.getLinkTokens('end');
                        if (toEndTokens.find((toEndToken) => {
                            return endTokens.find((endToken) => {
                                return endToken.name === toEndToken.name;
                            });
                        })) {
                            determineOutputToken(toToken,
                                [...outputTokens], weight + nextLink.weight + weightPlus, false);
                        }
                    });
                }
            };

            /*significantWeightedSpreadStartTokenSelect*/
            significantTokens.map(t => t.name).forEach((startTokenName) => {
                determineOutputToken(this.tokens[startTokenName]);
            });
            outputTokenOptions.sort((a, b) => {
                return b.weight - a.weight;
            });

            // 5. Produce token output from start token to end token
            const outputTokenOptionsSelect = outputTokenOptions.slice(0, options.optionSelect);
            const outputTokenOption = outputTokenOptionsSelect[Math.floor(Math.random() * outputTokenOptionsSelect.length)];
            if (outputTokenOption) {
                return outputTokenOption.tokens.map((token) => {
                    return token.name.trim();
                }).join(' ');
            }
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
