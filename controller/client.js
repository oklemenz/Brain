#!/usr/bin/env node
'use strict';

const program = require('commander');

const util = require('../common/util');
const packageJSON = require('../package.json');

program.Command.prototype.usageMinusWildcard = program.usageMinusWildcard = function () {
    program.commands = _.reject(program.commands, {_name: '*'});
    program.help();
};

program
    .version(packageJSON.version, '-v, --version')
    .usage('[command] [options]');

program
    .command('in <data>')
    .alias('i')
    .description('Input into brain')
    .action((data) => {
        util.httpPost('in', data).then((response) => {
            console.log(response);
        });
    });

program
    .command('out')
    .alias('o')
    .description('Output from brain')
    .action((data) => {
        util.httpGet('out').then((response) => {
            console.log(response);
        });
    });

program
    .command('sleep')
    .alias('l')
    .description('Brain sleeps')
    .action(() => {
        util.httpPost('sleep').then((response) => {
            console.log(response);
        });
    });

program
    .command('wake')
    .alias('w')
    .description('Brain is wake')
    .action(() => {
        util.httpPost('wake').then((response) => {
            console.log(response);
        });
    });


program
    .command('store')
    .alias('s')
    .description('Store brain')
    .action(() => {
        util.httpPost('store').then((response) => {
            console.log(response);
        });
    });

program
    .command('reset')
    .alias('r')
    .description('Reset brain')
    .action(() => {
        util.httpPost('reset').then((response) => {
            console.log(response);
        });
    });

program.parse(process.argv);
