#!/usr/bin/env node
'use strict';

const program = require('commander');

const shared = require('../common/util');
const packageJson = require('../package.json');

program.Command.prototype.usageMinusWildcard = program.usageMinusWildcard = function () {
    program.commands = _.reject(program.commands, {_name: '*'});
    program.help();
};

program
    .version(packageJson.version, '-v, --version')
    .usage('[command] [options]');

program
    .command('input <data>')
    .alias('i')
    .description('Input into brain')
    .action((data) => {
        shared.httpPost(data, 'input').then((response) => {
            console.log(response);
        });
    });

program
    .command('output')
    .alias('o')
    .description('Output from brain')
    .action((data) => {
        shared.httpGet('output').then((response) => {
            console.log(response);
        });
    });

program
    .command('store')
    .alias('s')
    .description('Store brain')
    .action(() => {
        shared.httpPost('', 'store').then((response) => {
            console.log(response);
        });
    });

program
    .command('reset')
    .alias('r')
    .description('Reset brain')
    .action(() => {
        shared.httpPost('', 'reset').then((response) => {
            console.log(response);
        });
    });

program.parse(process.argv);
