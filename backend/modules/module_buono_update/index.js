module.exports.auth_required = true;
module.exports.privs = ["BUONI"];

module.exports.format = [{
    field: "modified",
    required: true,
    type: "array",
    inner: [
        {
            field: "id",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "tipo",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "valore",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "minimo",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "usato",
            required: true,
            type: "number",
            strict: false
        },
    ]
}];


module.exports.callback = function (proxy) {
    if (proxy.recv.modified)
        proxy.recv.modified.forEach(e => {
            getConnection().query(`INSERT INTO cupons(id, tipo, valore, minimo, usato) VALUES (${proxy.secure(e.id)}, ${proxy.secure(e.tipo)}, ${proxy.secure(e.valore)}, ${proxy.secure(e.minimo)}, ${proxy.secure(e.usato) ? 1 : 0}) ON DUPLICATE KEY UPDATE id=${proxy.secure(e.id)}, tipo=${proxy.secure(e.tipo)}, valore=${proxy.secure(e.valore)}, minimo=${proxy.secure(e.minimo)}, usato=${proxy.secure(e.usato) ? 1 : 0}`);
        });
}