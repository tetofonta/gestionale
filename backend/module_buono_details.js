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
        getConnection().query(`SELECT tipo, valore, minimo FROM cupons WHERE usato = 0 AND id = ${secure(data.id)}`, (e, r, f) => {
            if (r.length < 1) {
                res.send({state: false, err: ""});
                return;
            }
            if (r && !e) {
                res.send({state: true, tipo: r[0].tipo, valore: r[0].valore, minimo: r[0].minimo});
                return;
            }
            res.send({state: false, err: ""})
        });

    });
}