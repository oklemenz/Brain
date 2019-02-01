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
    .description('Brain input')
    .action((data) => {
        util.httpPost('in', data).then((response) => {
            console.log(response);
        });
    });

program
    .command('out')
    .alias('o')
    .description('Brain output')
    .action((data) => {
        util.httpGet('out').then((response) => {
            console.log(response);
        });
    });

program
    .command('sleep')
    .alias('l')
    .description('Brain is sleeping')
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
    .command('train')
    .alias('t')
    .description('Brain is trained')
    .action(() => {
        util.httpPost('train').then((response) => {
            console.log(response);
        });
    });

program
    .command('wait')
    .alias('t')
    .description('Brain is waiting')
    .action(() => {
        util.httpPost('wait').then((response) => {
            console.log(response);
        });
    });

program
    .command('store')
    .alias('s')
    .description('Brain is stored')
    .action(() => {
        util.httpPost('store').then((response) => {
            console.log(response);
        });
    });

program
    .command('reset')
    .alias('r')
    .description('Brain is reset')
    .action(() => {
        util.httpPost('reset').then((response) => {
            console.log(response);
        });
    });

program.parse(process.argv);
