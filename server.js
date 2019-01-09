'use strict';

const express = require('express');
const bodyparser = require('body-parser');
const fs = require('fs');

const {endpoint, PORT, PATH} = require('./shared');
const {Model} = require('./model');

const MODEL_DATA = './model/model.json';
const model = new Model();

const app = express();
app.use(bodyparser.text());

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
app.use(`/${PATH}`, router);

function load() {
    if (fs.existsSync(MODEL_DATA)) {
        model.load(fs.readFileSync(MODEL_DATA));
    }
}

function store() {
    fs.writeFileSync(MODEL_DATA, model.store());
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
