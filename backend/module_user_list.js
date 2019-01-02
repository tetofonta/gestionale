const {getNW} = require("./network");
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const crypto = require('crypto');

module.exports.callback = function (req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT  utenti.username,  utenti.name,  utenti.enabled,  utenti.admin,  GROUP_CONCAT(description) as privs from  utenti, previlegi, utenti_previlegi_assoc where (username='${data.user}' OR (SELECT admin from utenti where username='${data.user}')) AND utenti.id=utenti_FOREGIN and previlegi.id=previlegi_FOREGIN group by username;`, (err, resp, fields) => {
            getConnection().query('select GROUP_CONCAT(description) as lol from previlegi', (perr, pset, fi) => {
                if (resp && !err && !perr) {
                    let privs = pset[0].lol.split(",");

                    let ret = [];
                    for (let i = 0, l = resp.length; i < l; i++)
                        ret = ret.concat({
                            username: resp[i].username,
                            name: resp[i].name,
                            isEnabled: resp[i].enabled,
                            isAdmin: resp[i].admin,
                            privs: resp[i].privs.split(",")
                        })
                    res.send({state: true, list: ret, privs: privs});
                    return;
                }
                err && console.log(err);
                res.send({state: false, err: "500"})
            });
        });
    }, ["UTENTI"]);
};
