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
router.post(`/input`, function (req, res) {
    const data = req.body;
    model.input(data);
    res.send(model.output());
});

router.get(`/output`, function (req, res) {
    res.send(model.output());
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
    }
}

function store() {
    fs.writeFileSync(modelData, model.store());
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
