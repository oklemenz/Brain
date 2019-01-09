'use strict';

const Entity = require('./entity');
const Link = require('./link');

class Token extends Entity {

    constructor(name) {
        super('Token');
        this.init();
        this.name = name;
    }

    init() {
        this.name = '';
        this.count = 0;
        this.links = [];
    }

    link(name, token, data) {
        const _link = new Link(name, this, token, data);
        let link = this.links.find((link) => {
            return link.equals(_link);
        });
        if (!link) {
            link = _link;
            this.links.push(link);
        } else {
            link.count++;
        }
        return link;
    }

    equals(token) {
        return this.name === token.name;
    }

    toString() {
        return this.name;
    }
}

module.exports = Token;
