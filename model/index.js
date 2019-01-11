'use strict';

global.model = {
    Types: {},
    Symbols: {}
};

const Model = require('./Model');
const Token = require('./Token');
const Link = require('./Link');

global.model.Types.Model = Model;
global.model.Types.Token = Token;
global.model.Types.Link = Link;

global.model.Symbols.Root = Symbol.for('Root');
global.model.Symbols.Parent = Symbol.for('Parent');

module.exports = {
    Model,
    Token,
    Link
};
