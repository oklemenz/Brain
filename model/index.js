'use strict';

const Brain = require('./Brain');
const Token = require('./Token');
const Link = require('./Link');

module.exports = {
    Brain,
    Token,
    Link
};

global.brain.registerType('Brain', Brain);
global.brain.registerType('Token', Token);
global.brain.registerType('Link', Link);
