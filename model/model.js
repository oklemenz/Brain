'use strict';

const Entity = require('./entity');
const Token = require('./token');
const Link = require('./link');

const {assignTypes} = require('../shared');

class Model extends Entity {

    constructor() {
        super('Model');
        this.init();
    }

    init() {
        this.tokens = {};
    }

    reset() {
        this.init();
    }

    load(data) {
        this.init();
        Object.assign(this, assignTypes(JSON.parse(data)));
    }

    store() {
        return JSON.stringify(this);
    }

    input(data) {
        if (!data) {
            return;
        }
        const tokenNames = data.split(/\s+/);
        tokenNames.forEach((tokenName) => {
            let token = this.tokens[tokenName];
            if (!token) {
                token = new Token(tokenName);
                this.tokens[tokenName] = token;
            }
        });
    }

    output() {
        return 'Thx';
    }
}

module.exports = Model;
