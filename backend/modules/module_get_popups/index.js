module.exports.auth_required = true;
module.exports.privs = ["MAGAZZINO"];

module.exports.format = [];

module.exports.callback = function (proxy) {
    proxy.getConnection().query(`SELECT id, json FROM details WHERE 1 ORDER BY id ASC`, (e, r, f) => {
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
