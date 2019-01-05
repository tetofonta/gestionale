/**
 * Ritorna la lista dei piatti disponibili
 * @return JSON, {state: bool} in caso di errore, {state: bool, list: {<CATEGORIA>: {bg: String, elements: [{desc: String, info: String, dispon: bool, eur: Number, cents: Number, details: {display: bool, title: String, dialog: {select: [vals...], choose: [vals...]}}]}, <...>:{...}}}
 */

module.exports.auth_required = true;
module.exports.privs = ["MAGAZZINO"];

module.exports.format = [{
    field: "modified",
    required: true,
    type: "array",
    inner: [
        {
            field: "costo",
            required: true,
            type: "string"
        },
        {
            field: "id",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "desc",
            required: true,
            type: "string"
        },
        {
            field: "info",
            required: true,
            type: "string"
        },
        {
            field: "giacenza",
            required: true,
            type: "number",
            strict: false
        },
    ]
}];

module.exports.callback = function (proxy) {
    let data = proxy.recv;

    let error = false;
    data.modified.forEach(e => {
        if(!e.costo.contains(".")) e.costo += ".00";
        e.eur = parseInt(e.costo.split(".")[0]);
        e.cents = parseInt(e.costo.split(".")[1]);
        if(isNaN(e.eur) ||  isNaN(e.cents)) error = true;
    });

    if(error) proxy.send({state: false, err: "invalid price value"});

    data.modified.forEach(e => {
        proxy.getConnection().query(`INSERT INTO magazzino(id, descrizione, info, giacenza, prezzoEur, prezzoCents, gruppo, details) VALUES (${proxy.secure(e.id)}, ${proxy.secure(e.desc)}, ${proxy.secure(e.info)}, ${proxy.secure(e.giacenza)}, ${proxy.secure(e.eur)}, ${proxy.secure(e.cents)}, 1, 1) ON DUPLICATE KEY UPDATE id=${proxy.secure(e.id)}, descrizione="${e.desc}", info="${proxy.secure(e.info)}", giacenza=${proxy.secure(e.giacenza)}, prezzoEur=${proxy.secure(e.eur)}, prezzoCents=${proxy.secure(e.cents)}, gruppo=1, details=1`);
    });

    proxy.send({state: true});
};
