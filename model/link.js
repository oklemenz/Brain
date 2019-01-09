'use strict';

const Entity = require('./entity');

class Link extends Entity {

    constructor(name, from, to, data) {
        super('Link');
        this.init();
        this.name = name;
        this.from = from.name || from;
        this.to = to.name || to;
        this.data = data || {};
    }

    init() {
        this.name = '';
        this.from = null;
        this.to = null;
        this.data = {};
        this.count = 0;
    }

    equals(link) {
        return this.name === link.name && this.from === link.from && this.to === link.to;
    }

    toString() {
        return `${this.name}:${this.from}->${this.to}(${this.count})`;
    }
}

module.exports = Link;
