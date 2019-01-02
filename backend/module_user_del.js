const {getNW} = require("./network");
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const crypto = require('crypto');

module.exports.callback = function (req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`DELETE FROM utenti_previlegi_assoc WHERE utenti_FOREGIN=(SELECT id FROM utenti WHERE username='${secure(data.modusername)}')`, (e, resp, f) => {
            if (resp && !e) {
                getConnection().query(`DELETE FROM utenti WHERE username='${secure(data.modusername)}'`, (e, resp, f) => {
                    if (resp && !e) {
                        res.send({state: true, err: "OK"});
                        return;
                    }
                    console.log(e);
                    res.send({state: false, err: "500"});
                });
                return;
            }
            console.log(e);
            res.send({state: false, err: "500"});
        });
    }, ["UTENTI"]);
};
