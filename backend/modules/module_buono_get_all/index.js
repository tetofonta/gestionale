module.exports.auth_required = true;
module.exports.privs = ["BUONI"];

module.exports.format = [];

module.exports.callback = function (proxy) {
        proxy.getConnection().query(`SELECT id, tipo, valore, minimo, usato FROM cupons WHERE 1 ORDER BY id ASC`, (e, r, f) => {
            if (r.length < 1) {
                proxy.send({state: false, err: ""});
                return;
            }
            if (r && !e) {
                proxy.send({state: true, list: r});
                return;
            }
            proxy.send({state: false, err: ""})
        });
}