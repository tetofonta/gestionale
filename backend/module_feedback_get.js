const {getNW} = require("./network");
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const crypto = require('crypto');

module.exports.callback = function (req, res) {
    getConnection().query(`SELECT id, testo, answerType, details, title FROM questions`, (e, r) => {
        if (!r || e) res.send({state: false, err: e});
        else res.send({state: true, result: r});
    })
};
