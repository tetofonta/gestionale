const {getNW} = require("./network");
const crypto = require('crypto');
const {onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const http = require("http");
const request = require("request");
const querystring = require("querystring");
const cfg = require("./network.config");


module.exports.callback = function (req, res) {
    onUserAuthenticated(req, res, (data) => {
        request.post({
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `${cfg.network.manager_use_ssl ? "https://" : "http://" }${cfg.managerIP}:${cfg.managerPort}/api/operate`,
            body: JSON.stringify(data)
        }, (err, resp, body) => {
            res.send(body)
        })
    });
}