'use strict';

class Entity {

    constructor(type) {
        this._type = type;
        this.init();
    }

    init() {
        this.weight = 0;
        this.time = Date.now();
    }

    touch() {
        this.weight++;
        this.time = Date.now();
    }

    forget() {
        this.weight--;
        if (this.weight < 0) {
            this.weight = 0;
            return true;
        }
        return false;
    }

    root() {
        return this[global.model.Symbols.Root];
    }

    parent() {
        return this[global.model.Symbols.Parent];
    }

    toString() {
        return this._type;
    }
}

module.exports = Entity;
