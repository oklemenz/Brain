'use strict';

const Model = require('./model');

class Token extends Model {

    constructor(name) {
        super('Token');
        this.init();
        this.name = name;
    }

    init() {
    }
}

module.exports = Token;
