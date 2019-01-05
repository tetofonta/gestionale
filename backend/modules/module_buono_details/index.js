module.exports.format = [];

module.exports.auth_required = true;

module.exports.format = [{
    field: "id",
    required: true,
    strict: false,
    type: "number"
}];


module.exports.callback = function (proxy) {

    proxy.getConnection().query(`SELECT tipo, valore, minimo FROM cupons WHERE usato = 0 AND id = ${proxy.secure(proxy.recv.id)}`, (e, r, f) => {
        if (r.length < 1) {
            proxy.send({state: false, err: ""});
            return;
        }
        if (r && !e) {
            proxy.send({state: true, tipo: r[0].tipo, valore: r[0].valore, minimo: r[0].minimo});
            return;
        }
        proxy.send({state: false, err: ""})
    });

};