'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const fs = require('fs');

const {endpoint, PORT, PATH} = require('./shared');
const {Brain} = require('./model');

const BRAIN_DATA = './model/brain.json';
const brain = new Brain();

const app = express();
app.use(bodyparser.text());

var router = express.Router();
router.post(`/input`, function (req, res) {
    const data = req.body;
    brain.input(data);
    res.send(brain.output());
});

router.get(`/output`, function (req, res) {
    res.send(brain.output());
});

router.post(`/store`, function (req, res) {
    store();
    res.send('Stored!');
});

router.post(`/reset`, function (req, res) {
    brain.reset();
    store();
    res.send('Reset!');
});
app.use(`/${PATH}`, router);

function load() {
    if (fs.existsSync(BRAIN_DATA)) {
        brain.load(fs.readFileSync(BRAIN_DATA));
    }
}

function store() {
    fs.writeFileSync(BRAIN_DATA, brain.store());
}

function start() {
    app.listen(PORT, function () {
        console.log(`Brain running on ${endpoint}`);
    });
}

module.exports = {
    load,
    store,
    start
};
