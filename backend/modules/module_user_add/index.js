const crypto = require("crypto");

module.exports.auth_required = true;
module.exports.privs = ["UTENTI"];

module.exports.format = [
    {
        field: "psw",
        type: "string",
        required: true
    },
    {
        field: "newuser",
        type: "string",
        required: true
    },
    {
        field: "name",
        type: "string",
        required: true
    },
    {
        field: "admin",
        type: "number",
        required: true,
        strict: false
    }
];

module.exports.callback = function (proxy) {
    let data = proxy.recv;
    proxy.getConnection().query(`SELECT id, admin FROM utenti WHERE username='${proxy.secure(data.user)}'`, (e, resp, f) => {
        if (resp && !e) {
            if (resp[0].admin === 1) {
                let shapsw = crypto.createHash('sha1');
                shapsw.update(data.psw);
                let isSecure = 1;
                if (data.psw === "admin" || data.psw === "root" || data.psw.toUpperCase() === data.user.toUpperCase() || data.newPsw.length < 8) isSecure = 0;
                proxy.getConnection().query(`INSERT INTO utenti(username, password, name, secure, enabled, admin) VALUES('${proxy.secure(data.newuser)}', '${shapsw.digest('hex')}', '${proxy.secure(data.name)}', ${isSecure}, 1, ${data.admin});`, (er, re, fi) => {
                    if (!er)
                        getConnection().query(`INSERT INTO utenti_previlegi_assoc(utenti_FOREGIN, previlegi_FOREGIN) VALUES(LAST_INSERT_ID(), 1);`, (er, re) => {
                            if (!er) {
                                proxy.send({state: true, err: "OK"});
                                return;
                            }
                            console.log(er);
                            proxy.send({state: false, err: "500"});
                        });
                    else console.log(er);
                });
                return;
            }
        }
        console.log(e);
        proxy.send({state: false, err: "500"});
    });
};
