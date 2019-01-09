'use strict';

const Entity = require('./entity');

class Token extends Entity {

    constructor(name) {
        super('Token');
        this.init();
        this.name = name;
    }

    init() {
    }
}

module.exports = Token;
