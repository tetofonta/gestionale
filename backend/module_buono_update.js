const {getNW} = require("./network");
const crypto = require('crypto');
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const http = require("http");
const request = require("request");
const querystring = require("querystring");
const cfg = require("./network.config");


module.exports.callback = function (req, res) {
    onUserAuthenticated(req, res, (data) => {
        if (data.modified)
            data.modified.forEach(e => {
                getConnection().query(`INSERT INTO cupons(id, tipo, valore, minimo, usato) VALUES (${e.id}, ${e.tipo}, ${e.valore}, ${e.minimo}, ${e.usato ? 1 : 0}) ON DUPLICATE KEY UPDATE id=${e.id}, tipo=${e.tipo}, valore=${e.valore}, minimo=${e.minimo}, usato=${e.usato ? 1 : 0}`);
            });
    }, ["BUONI"]);
}