const {getNW} = require("./network");
const crypto = require('crypto');
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const http = require("http");
const request = require("request");
const querystring = require("querystring");
const cfg = require("./network.config");


module.exports.callback = function (req, res) {
    if (getNW(req)) {
        getConnection().query(`SELECT moduleName, \`to\` as too, isPublic, isPrivate FROM funzioni WHERE 1`, (e, r) => {
            if (!r || e) {
                console.error(e);
                res.send({state: false, err: e.toString()});
                return;
            }

            let privates = [];
            let publics = [];

            r.forEach(e => {
                if (e.isPublic) publics.push(e);
                else if (e.isPrivate) privates.push(e);
            });

            res.send({state: true, publics: publics, privates: privates})
        })
    } else {
        getConnection().query(`SELECT moduleName, \`to\` as too, isPublic, 0 as isPrivate FROM funzioni WHERE isPublic = 1`, (e, r) => {
            if (!r || e) {
                console.error(e);
                res.send({state: false, err: e.toString()});
                return;
            }

            let privates = [];
            let publics = [];

            r.forEach(e => {
                if (e.isPublic) publics.push(e);
                else if (e.isPrivate) privates.push(e);
            });

            res.send({state: true, publics: publics, privates: privates})
        })
    }

}