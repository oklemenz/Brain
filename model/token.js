'use strict';

const Entity = require('./entity');
const Link = require('./link');

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

    equals(token) {
        return this.name === token.name;
    }

    toString() {
        return this.name;
    }
}

module.exports = Token;
