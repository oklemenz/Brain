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

    getMaxWeightLink() {
        return this.links.reduce((maxLink, link) => {
            if (!maxLink || link.weight > maxLink.weight) {
                maxLink = link;
            }
            return maxLink;
        }, undefined);
    }

    hasLinkForToToken(tokenName) {
        return this.links.find((link) => {
            return link.to === tokenName;
        });
    }

    linkCount() {
        return this.links.length;
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
