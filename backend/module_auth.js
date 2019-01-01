const {getNW} = require('./network');
const {getConnection, secure} = require('./mysql');
const user_association = new Map();
const crypto = require('crypto');
const request = require("request");
const cfg = require("./network.config");

/**
 * Autentica l'utente
 * @param req express request obj
 * @param res express response obj
 * @requires POST, {user: String, token: String}
 * @return JSON, {state: bool, err: String} in caso di errore, {state: bool, token: String, username: String, name: String, secure: Number *as bool*, isAdmin: Number *as bool*}
 */
module.exports.callback = function(req, res) {
    request.post({
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: `http://${cfg.managerIP}:${cfg.managerPort}/api/auth`,
        body: JSON.stringify(req.body)
    }, (err, resp, body) => {
        res.send(body)
    })
};
