'use strict';

const Entity = require('./entity');

const options = require('../common/util');

class Link extends Entity {

    constructor(name, from, to, data) {
        super('Link');
        this.name = name;
        this.from = from.name !== undefined ? from.name : from;
        this.to = to.name !== undefined ? to.name : to;
        this.data = data || {};
    }

    init() {
        super.init();
        this.name = '';
        this.from = null;
        this.to = null;
        this.data = {};
    }

    fromToken() {
        return this.root().token(this.from);
    }

    toToken() {
        return this.root().token(this.to);
    }

    isSignificant() {
        if (this.weight < this.root().avgWeight - this.root().stdDevWeight * options.weightSignificanceBottom) {
            return false;
        }
        if (this.weight > this.root().avgWeight + this.root().stdDevWeight * options.weightSignificanceTop) {
            return false;
        }
        return true;
    }

    equals(link) {
        return this.name === link.name && this.from === link.from && this.to === link.to;
    }

    toString() {
        return `${this.name}:${this.from}->${this.to}(${this.weight})`;
    }
}

module.exports = Link;
