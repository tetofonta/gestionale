const {getNW} = require("./network");
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const crypto = require('crypto');

function usr_getList(req, res) {
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
}

function usr_edit(req, res) {
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
}

function usr_new(req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, admin FROM utenti WHERE username='${secure(data.user)}'`, (e, resp, f) => {
            if (resp && !e) {
                if (resp[0].admin === 1) {
                    let shapsw = crypto.createHash('sha1');
                    shapsw.update(data.psw);
                    let isSecure = 1;
                    if (data.psw === "admin" || data.psw === "root" || data.psw.toUpperCase() === data.user.toUpperCase() || data.newPsw.length < 8) isSecure = 0;
                    getConnection().query(`INSERT INTO utenti(username, password, name, secure, enabled, admin) VALUES('${secure(data.newuser)}', '${shapsw.digest('hex')}', '${secure(data.name)}', ${isSecure}, 1, ${data.admin});`, (er, re, fi) => {
                        if (!er)
                            getConnection().query(`INSERT INTO utenti_previlegi_assoc(utenti_FOREGIN, previlegi_FOREGIN) VALUES(LAST_INSERT_ID(), 1);`, (er, re) => {
                                if (!er) {
                                    res.send({state: true, err: "OK"});
                                    return;
                                }
                                console.log(er);
                                res.send({state: false, err: "500"});
                            });
                        else console.log(er);
                    });
                    return;
                }
            }
            console.log(e);
            res.send({state: false, err: "500"});
        });
    }, ["UTENTI"]);
}

function usr_del(req, res) {
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
}

function usr_getAccessibleFunctions(req, res) {
    if (!(getNW(req) && !req.body.guest)) {
        getConnection().query(`select funzioni.modulename as modulo, funzioni.tooltip as tooltip, funzioni.to as too,titolo, descrizione, categoria.nome as catName, categoria.icona as catIcon, funzioni.icona as fncIcon from funzioni, categoria where categoria.id = funzioni.categoria AND funzioni.isPublic = 1;`, (err, resp, fields) => {
            let cats = new Map();
            if (resp && !err) {
                for (let i = 0; i < resp.length; i++) {
                    if (!cats.has(resp[i].catName)) cats.set(resp[i].catName, {icon: resp[i].catIcon, fncs: []});
                    cats.get(resp[i].catName).fncs.push({
                        name: resp[i].titolo,
                        desc: resp[i].descrizione,
                        icon: resp[i].fncIcon,
                        to: resp[i].too,
                        tooltip: resp[i].tooltip,
                        modulename: resp[i].modulo
                    })
                }
                let ret = [];

                cats.forEach((v, k) => {
                    ret.push({category: k, icon: v.icon, content: v.fncs})
                });
                res.send({state: true, ret: ret});
                return;
            }
            console.log(err);
            res.send({state: false, err: "500"});
        });
    } else
        onUserAuthenticated(req, res, (data) => {
            getConnection().query(`select funzioni.modulename as modulo, funzioni.tooltip as tooltip, funzioni.to as too,titolo, descrizione, categoria.nome as catName, categoria.icona as catIcon, funzioni.icona as fncIcon from funzioni, categoria where categoria.id = funzioni.categoria AND req_prev IN (SELECT previlegi_FOREGIN from utenti_previlegi_assoc, utenti where utenti.id = utenti_FOREGIN AND utenti.username = '${data.user}') and funzioni.isPrivate = 1;`, (err, resp, fields) => {
                let cats = new Map();
                if (resp && !err) {
                    for (let i = 0; i < resp.length; i++) {
                        if (!cats.has(resp[i].catName)) cats.set(resp[i].catName, {icon: resp[i].catIcon, fncs: []});
                        cats.get(resp[i].catName).fncs.push({
                            name: resp[i].titolo,
                            desc: resp[i].descrizione,
                            icon: resp[i].fncIcon,
                            to: resp[i].too,
                            tooltip: resp[i].tooltip,
                            modulename: resp[i].modulo
                        })
                    }
                    let ret = [];

                    cats.forEach((v, k) => {
                        ret.push({category: k, icon: v.icon, content: v.fncs})
                    });
                    res.send({state: true, ret: ret});
                    return;
                }
                console.log(err);
                res.send({state: false, err: "500"});
            });
        });
}

module.exports.usr_getList = usr_getList;
module.exports.usr_edit = usr_edit;
module.exports.usr_new = usr_new;
module.exports.usr_del = usr_del;
module.exports.usr_getAccessibleFunctions = usr_getAccessibleFunctions;