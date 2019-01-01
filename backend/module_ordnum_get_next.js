const {getNW} = require("./network");
const crypto = require('crypto');
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const http = require("http");
const request = require("request");
const querystring = require("querystring");
const cfg = require("./network.config");


module.exports.callback = function (req, res) {
    onUserAuthenticated(req, res, () => {
        request(`http://${cfg.managerIP}:${cfg.managerPort}/api/getNext`, req.body, (err, resp, body) => {
            res.send(body)
        })
    }, ["CASSA"]);
}