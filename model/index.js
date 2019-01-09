'use strict';

const Model = require('./Model');
const Token = require('./Token');
const Link = require('./Link');

module.exports = {
    Model,
    Token,
    Link
};

global.model.registerType('Model', Model);
global.model.registerType('Token', Token);
global.model.registerType('Link', Link);
