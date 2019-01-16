module.exports.auth_required = true;
module.exports.privs = ["MAGAZZINO"];

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
            field: "descrizione",
            required: true,
            type: "text",
            strict: false
        },
        {
            field: "info",
            required: true,
            type: "text",
            strict: false
        },
        {
            field: "giacenza",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "costo",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "gruppo",
            required: true,
            type: "object",
            strict: false
        },
        {
            field: "popup",
            required: true,
            type: "object",
            strict: false
        },
    ]
}];


module.exports.callback = function (proxy) {
    console.log(JSON.stringify(proxy.recv, true))
    console.log(JSON.stringify(proxy.recv.popup, true))
    console.log(JSON.stringify(proxy.recv.gruppo, true))

    if (proxy.recv.modified)
        proxy.recv.modified.forEach(e => {
            proxy.getConnection().query(`INSERT INTO magazzino(id, descrizione, info, giacenza, prezzoEur, prezzoCents, gruppo, details) VALUES ('${proxy.secure(e.id)}', '${proxy.secure(e.desc)}', '${proxy.secure(e.info)}', '${proxy.secure(e.giacenza)}', '${parseInt(proxy.secure(("" + e.costo).split('.')[0]))}', '${parseInt(proxy.secure(("" + e.costo).split('.')[1]))}', '${proxy.secure(e.gruppo.id)}', '${JSON.stringify(proxy.secure(e.popup.id))}') ON DUPLICATE KEY UPDATE id='${proxy.secure(e.id)}', descrizione='${proxy.secure(e.desc)}', info='${proxy.secure(e.info)}', giacenza='${proxy.secure(e.giacenza)}', prezzoEur='${parseInt(proxy.secure(("" + e.costo).split('.')[0]))}', prezzoCents='${parseInt(proxy.secure(("" + e.costo).split('.')[1]))}', gruppo='${proxy.secure(e.gruppo.id)}', details='${JSON.stringify(proxy.secure(e.popup.id))}'`, (e, r) => {
                console.log(e)
            });
        });
    proxy.send({state: true})
}