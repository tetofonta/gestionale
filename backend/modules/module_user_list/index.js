module.exports.auth_required = true;
module.exports.privs = ["UTENTI"];

module.exports.format = [];
module.exports.callback = function (proxy) {
        proxy.getConnection().query(`SELECT  utenti.username,  utenti.name,  utenti.enabled,  utenti.admin,  GROUP_CONCAT(description) as privs from  utenti, previlegi, utenti_previlegi_assoc where (username='${proxy.recv.user}' OR (SELECT admin from utenti where username='${proxy.recv.user}')) AND utenti.id=utenti_FOREGIN and previlegi.id=previlegi_FOREGIN group by username;`, (err, resp, fields) => {
            proxy.getConnection().query('select GROUP_CONCAT(description) as lol from previlegi', (perr, pset, fi) => {
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
                    proxy.send({state: true, list: ret, privs: privs});
                    return;
                }
                err && console.log(err);
                proxy.send({state: false, err: "500"})
            });
        });
};
