const {getNW} = require("./network");
const crypto = require('crypto');
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const http = require("http");
const request = require("request");
const querystring = require("querystring");
const cfg = require("./network.config");
const srs = require('secure-random-string');


module.exports.callback = function (req, res) {
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    ip = ip.replace("::ffff:", "");
    let r = {
        client: ip,
        usr: req.body.usr,
        psw: req.body.psw
    };

    request.post({
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: `${cfg.network.captive_login_use_ssl ? "https://" : "http://"}${cfg.loginIP}:${cfg.serverLoginPort}/api/login`,
        body: JSON.stringify(r)
    }, (err, resp, body) => {
        res.send(body)
    })
};