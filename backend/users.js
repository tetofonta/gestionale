const {getNW} = require("./network");
const {getUsers} = require("./auth");
const {getConnection} = require("./mysql");
const crypto = require('crypto');


String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function usr_getList(req, res) {
    if (getNW(req)) {

        let data = req.body;
        console.log(data);
        try {
            data.user = data.user.replaceAll("'", "");
            data.token = data.token.replaceAll("'", "");
            console.log(data);
            console.log(data.user);
            console.log(data.token);
            console.log(getUsers().get(data.user));
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

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

        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

function usr_edit(req, res) {
    if (getNW(req)) {

        let data = req.body;

        try {
            data.user = data.user.replaceAll("'", "");
            data.token = data.token.replaceAll("'", "");
            data.modusername = data.modusername.replaceAll("'", "");
            data.name = data.name.replaceAll("'", "");
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        for (let i = 0; i < data.descr.length; i++) data.descr[i] = data.descr[i].replaceAll("'", "");

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

        console.log(data);

        getConnection().query(`SELECT id, admin FROM utenti WHERE username='${data.user}'`, (e, resp, f) => {
            if (resp && !e) {
                if (resp[0].admin !== 1) {
                    data.admin = 0;
                } else {
                    getConnection().query(`DELETE FROM utenti_previlegi_assoc WHERE utenti_FOREGIN=(SELECT utenti.id FROM utenti WHERE utenti.username='${data.modusername}');`, (er, re, fi) => {
                        if (!er) {
                            data.states.forEach((e, i) => {
                                if (e)
                                    getConnection().query(`INSERT INTO utenti_previlegi_assoc(utenti_FOREGIN, previlegi_FOREGIN) SELECT utenti.id, previlegi.id FROM utenti, previlegi WHERE utenti.username='${data.modusername}' AND previlegi.description='${data.descr[i]}'`)
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
                getConnection().query(`UPDATE utenti SET name='${data.name}', admin=${data.admin ? 1 : 0} ${pswQuery} WHERE username='${data.modusername}'`, (e, r, f) => {
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
        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

function usr_new(req, res) {
    if (getNW(req)) {

        let data = req.body;
        console.log(data);
        try {
            data.user = data.user.replaceAll("'", "");
            data.token = data.token.replaceAll("'", "");
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

        getConnection().query(`SELECT id, admin FROM utenti WHERE username='${data.user}'`, (e, resp, f) => {
            if (resp && !e) {
                if (resp[0].admin === 1) {
                    let shapsw = crypto.createHash('sha1');
                    shapsw.update(data.psw);
                    let isSecure = 1;
                    if (data.psw === "admin" || data.psw === "root" || data.psw.toUpperCase() === data.user.toUpperCase() || data.newPsw.length < 8) isSecure = 0;
                    getConnection().query(`INSERT INTO utenti(username, password, name, secure, enabled, admin) VALUES('${data.newuser}', '${shapsw.digest('hex')}', '${data.name}', ${isSecure}, 1, ${data.admin});`, (er, re, fi) => {
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
        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

function usr_del(req, res) {
    if (getNW(req)) {

        let data = req.body;
        console.log(data);
        try {
            data.user = data.user.replaceAll("'", "");
            data.token = data.token.replaceAll("'", "");
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

        getConnection().query(`DELETE FROM utenti_previlegi_assoc WHERE utenti_FOREGIN=(SELECT id FROM utenti WHERE username='${data.modusername}')`, (e, resp, f) => {
            if (resp && !e) {
                getConnection().query(`DELETE FROM utenti WHERE username='${data.modusername}'`, (e, resp, f) => {
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
        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

function usr_getAccessibleFunctions(req, res) {
    if (getNW(req) && !req.body.guest) {

        let data = req.body;
        console.log(data);
        try {
            data.user = data.user.replaceAll("'", "");
            data.token = data.token.replaceAll("'", "");
            console.log(data);
            console.log(data.user);
            console.log(data.token);
            console.log(getUsers().get(data.user));
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

        getConnection().query(`select funzioni.tooltip as tooltip, funzioni.to as too,titolo, descrizione, categoria.nome as catName, categoria.icona as catIcon, funzioni.icona as fncIcon from funzioni, categoria where categoria.id = funzioni.categoria AND req_prev IN (SELECT previlegi_FOREGIN from utenti_previlegi_assoc, utenti where utenti.id = utenti_FOREGIN AND utenti.username = '${data.user}');`, (err, resp, fields) => {
            let cats = new Map();
            if (resp && !err) {
                for (let i = 0; i < resp.length; i++) {
                    if (!cats.has(resp[i].catName)) cats.set(resp[i].catName, {icon: resp[i].catIcon, fncs: []});
                    cats.get(resp[i].catName).fncs.push({
                        name: resp[i].titolo,
                        desc: resp[i].descrizione,
                        icon: resp[i].fncIcon,
                        to: resp[i].too,
                        tooltip: resp[i].tooltip
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
    } else {
        res.send({state: true, ret: [
                {
                    category: 'Self service',
                    icon: 'fas fa-user-astronaut',
                    content: [
                        {
                            name: 'Cassa',
                            desc: 'Crea il tuo ordine self service',
                            icon: 'fas fa-money-bill-alt',
                            to: '/newOrdine',
                            tooltip: 'Crea il tuo ordine personalizzandolo come vuoi, vai in cassa a convalidarlo e salta la coda'
                        },
                        {
                            name: 'Feedback',
                            desc: 'Dicci cosa ne pensi',
                            icon: 'fas fa-comments',
                            to: '/guestFeedback',
                            tooltip: null
                        }
                    ]
                }
            ]});
    }
}

module.exports.usr_getList = usr_getList;
module.exports.usr_edit = usr_edit;
module.exports.usr_new = usr_new;
module.exports.usr_del = usr_del;
module.exports.usr_getAccessibleFunctions = usr_getAccessibleFunctions;