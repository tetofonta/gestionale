const {getNW} = require('./network');
const {getConnection, secure} = require('./mysql');
const user_association = new Map();
const crypto = require('crypto');
const request = require("request");
const cfg = require("./network.config");

/**
 * @userAuthenticated
 * Refresh dell'autenticazione
 * @param req express request obj
 * @param res express response obj
 * @requires POST, {username: String, token: String}
 * @return JSON, {state: bool, err: String} in caso di errore, {state: bool, token: String*}
 */
module.exports.callback = function(req, res) {
    request.post({
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: `http://${cfg.managerIP}:${cfg.managerPort}/api/refresh`,
        body: JSON.stringify(req.body)
    }, (err, resp, body) => {
        res.send(body)
    })
};
