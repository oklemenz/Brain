'use strict';

const Entity = require('./entity');

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

    equals(link) {
        return this.name === link.name && this.from === link.from && this.to === link.to;
    }

    toString() {
        return `${this.name}:${this.from}->${this.to}(${this.weight})`;
    }
}

module.exports = Link;
