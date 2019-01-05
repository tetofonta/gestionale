module.exports.auth_required = true;
module.exports.privs = ["UTENTI"];

module.exports.format = [
    {
        field: "modusername",
        type: "string",
        required: true
    }
];

module.exports.callback = function (proxy) {
    let data = proxy.recv;
    proxy.getConnection().query(`DELETE FROM utenti_previlegi_assoc WHERE utenti_FOREGIN=(SELECT id FROM utenti WHERE username='${proxy.secure(data.modusername)}')`, (e, resp, f) => {
        if (resp && !e) {
            proxy.getConnection().query(`DELETE FROM utenti WHERE username='${proxy.secure(data.modusername)}'`, (e, resp, f) => {
                if (resp && !e) {
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
