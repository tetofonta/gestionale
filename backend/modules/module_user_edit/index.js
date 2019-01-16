const crypto = require("crypto");

module.exports.auth_required = true;
module.exports.privs = ["UTENTI"];

module.exports.format = [
    {
        field: "modusername",
        type: "string",
        required: true
    },
    {
        field: "states",
        type: "array",
        required: true
    },
    {
        field: "descr",
        type: "array",
        required: true
    },
    {
        field: "editPsw",
        type: "string",
        required: true
    },
    {
        field: "newPsw",
        type: "string",
        required: false
    },
    {
        field: "name",
        type: "string",
        required: false
    },
    {
        field: "admin",
        type: "number",
        required: false,
        strict: false
    }
];

module.exports.callback = function (proxy) {
    let data = proxy.recv;
    proxy.getConnection().query(`SELECT id, admin FROM utenti WHERE username='${proxy.secure(data.user)}'`, (e, resp, f) => {
        if (resp && !e) {
            if (resp[0].admin !== 1) data.admin = 0;
            proxy.getConnection().query(`DELETE FROM utenti_previlegi_assoc WHERE utenti_FOREGIN=(SELECT utenti.id FROM utenti WHERE utenti.username='${proxy.secure(data.modusername)}');`, (er, re, fi) => {
                if (!er) {
                    data.states.forEach((e, i) => {
                        if (e)
                            proxy.getConnection().query(`INSERT INTO utenti_previlegi_assoc(utenti_FOREGIN, previlegi_FOREGIN) SELECT utenti.id, previlegi.id FROM utenti, previlegi WHERE utenti.username='${proxy.secure(data.modusername)}' AND previlegi.description='${proxy.secure(data.descr[i])}'`)
                    })
                } else
                    console.log(er)
            });
            let pswQuery = '';
            if (data.editPsw) {
                let shasum = crypto.createHash('sha1');
                shasum.update(data.newPsw);
                let sec = 1;
                if (data.newPsw === "admin" || data.newPsw === "root" || data.newPsw.toUpperCase() === data.modusername.toUpperCase() || data.newPsw.length < 8) sec = 0; //TODO: LE PASSWORD SONO IN SHA1 COGLIONE!!!
                pswQuery = ", password='" + shasum.digest('hex') + "', secure=" + sec;
            }
            proxy.getConnection().query(`UPDATE utenti SET name='${proxy.secure(data.name)}', admin=${data.admin ? 1 : 0} ${pswQuery} WHERE username='${proxy.secure(data.modusername)}'`, (e, r, f) => {
                if (r && !e) {
                    proxy.send({state: true, err: "OK"});
                    return;
                }
                console.log(e);
                proxy.send({state: false, err: "500"});
            });
            return;
        }
        console.log(e);
        proxy.send({state: false, err: "500"});
    });
};
