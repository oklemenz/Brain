'use strict';

const Entity = require('./entity');
const Link = require('./link');

const options = require('../common/util');

class Token extends Entity {

    constructor(name) {
        super('Token');
        this.name = name;
    }

    init() {
        super.init();
        this.name = '';
        this.links = [];
    }

    link(name, token, data) {
        const _link = new Link(name, this, token, data);
        let link = this.links.find((link) => {
            return link.equals(_link);
        });
        if (!link) {
            link = _link;
            link[global.model.Symbols.Root] = this.root();
            link[global.model.Symbols.Parent] = this;
            this.links.push(link);
        }
        link.touch();
        return link;
    }

    getLinks(name) {
        return this.links.filter((link) => {
            return link.name === name;
        });
    }

    getLinkTokens(name) {
        return this.getLinks(name).map((link) => {
            return link.toToken();
        });
    }

    getLinkForToToken(tokenName) {
        return this.links.find((link) => {
            return link.to === tokenName;
        });
    }

    getStartLinksWeightOrderDesc() {
        return this.getLinks('start').sort((a, b) => {
            return b.weight - a.weight;
        });
    }

    getEndLinksWeightOrderDesc() {
        return this.getLinks('end').sort((a, b) => {
            return b.weight - a.weight;
        });
    }

    getPrevLinksWeightOrderDesc() {
        return this.getLinks('prev').sort((a, b) => {
            return b.weight - a.weight;
        });
    }

    getNextLinksWeightOrderDesc() {
        return this.getLinks('next').sort((a, b) => {
            return b.weight - a.weight;
        });
    }

    getBeforeLinksWeightOrderDesc() {
        return this.getLinks('before').sort((a, b) => {
            return b.weight - a.weight;
        });
    }

    getAfterLinksWeightOrderDesc() {
        return this.getLinks('after').sort((a, b) => {
            return b.weight - a.weight;
        });
    }

    linkCount() {
        return this.links.length;
    }

    linkMaxWeight() {
        return this.links.reduce((max, link) => {
            if (!max || link.weight > max) {
                max = link.weight;
            }
            return max;
        }, 0);
    }

    isSignificant() {
        const linkCount = this.linkCount();
        if (linkCount < this.root().avgLinks - this.root().stdDevLinks * options.significanceBottom) {
            return false;
        }
        if (linkCount > this.root().avgLinks + this.root().stdDevLinks * options.significanceTop) {
            return false;
        }
        return true;
    }

    equals(token) {
        return this.name === token.name;
    }

    toString() {
        return this.name;
    }
}

module.exports = Token;
