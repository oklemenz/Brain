'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const {endpoint, port, path} = require('../common/util');
const {Model} = require('../model');

const modelData = './data.json';
const model = new Model();

const app = express();
app.use(bodyParser.text());

var router = express.Router();
router.post(`/in`, function (req, res) {
    const data = req.body;
    if (model.input(data)) {
        res.send(model.output());
    } else {
        res.send('zzzZZZ');
    }
});

router.get(`/out`, function (req, res) {
    res.send(model.output());
});

router.post(`/sleep`, function (req, res) {
    model.sleep();
    res.send('zzzZZZ');
});

router.post(`/wake`, function (req, res) {
    model.wake();
    res.send('Yes...');
});

router.post(`/store`, function (req, res) {
    store();
    res.send('Stored!');
});

router.post(`/reset`, function (req, res) {
    model.reset();
    store();
    res.send('Reset!');
});
app.use(`/${path}`, router);

function load() {
    if (fs.existsSync(modelData)) {
        model.load(fs.readFileSync(modelData));
        console.log('Loaded!');
    }
}

function store() {
    fs.writeFileSync(modelData, model.store());
    console.log('Stored!');
}

function start() {
    app.listen(port, function () {
        console.log(`Brain running on ${endpoint}`);
    });
}

module.exports = {
    load,
    store,
    start
};
