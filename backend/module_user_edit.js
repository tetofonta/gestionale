const {getNW} = require("./network");
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const crypto = require('crypto');

module.exports.callback = function (req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, admin FROM utenti WHERE username='${secure(data.user)}'`, (e, resp, f) => {
            if (resp && !e) {
                if (resp[0].admin !== 1) {
                    data.admin = 0;
                } else {
                    getConnection().query(`DELETE FROM utenti_previlegi_assoc WHERE utenti_FOREGIN=(SELECT utenti.id FROM utenti WHERE utenti.username='${secure(data.modusername)}');`, (er, re, fi) => {
                        if (!er) {
                            data.states.forEach((e, i) => {
                                if (e)
                                    getConnection().query(`INSERT INTO utenti_previlegi_assoc(utenti_FOREGIN, previlegi_FOREGIN) SELECT utenti.id, previlegi.id FROM utenti, previlegi WHERE utenti.username='${secure(data.modusername)}' AND previlegi.description='${secure(data.descr[i])}'`)
                            })
                        } else
                            console.log(er)
                    });
                }
                let pswQuery = '';
                if (data.editPsw) {
                    let shasum = crypto.createHash('sha1');
                    shasum.update(data.newPsw);
                    let sec = 1;
                    if (data.newPsw === "admin" || data.newPsw === "root" || data.newPsw.toUpperCase() === data.modusername.toUpperCase() || data.newPsw.length < 8) sec = 0; //TODO: LE PASSWORD SONO IN SHA1 COGLIONE!!!
                    pswQuery = ", password='" + shasum.digest('hex') + "', secure=" + sec;
                }
                getConnection().query(`UPDATE utenti SET name='${secure(data.name)}', admin=${data.admin ? 1 : 0} ${pswQuery} WHERE username='${secure(data.modusername)}'`, (e, r, f) => {
                    if (r && !e) {
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
