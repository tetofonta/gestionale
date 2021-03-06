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
            field: "detail",
            required: true,
            type: "object",
            strict: false
        },
    ]
}];


module.exports.callback = function (proxy) {
    if (proxy.recv.modified)
        proxy.recv.modified.forEach(e => {
                let cents = parseInt(("" + e.costo).split('.')[1]);

                if (!isNaN(cents)) {
                    let centsS = String(cents);
                    while (centsS.length < 2)
                        centsS += '0';
                    cents = parseInt(centsS);
                } else {
                    cents = parseInt(String('00'));
                }

                proxy.getConnection().query(`INSERT INTO magazzino(id, descrizione, info, giacenza, prezzoEur, prezzoCents, gruppo, details) VALUES ('${proxy.secure(e.id)}', '${proxy.secure(e.desc)}', '${proxy.secure(e.info)}', '${proxy.secure(e.giacenza)}', '${proxy.secure(parseInt(("" + e.costo).split('.')[0]))}', '${proxy.secure(cents)}', '${proxy.secure(e.gruppo.value)}', '${proxy.secure(e.detail.value)}') ON DUPLICATE KEY UPDATE id='${proxy.secure(e.id)}', descrizione='${proxy.secure(e.desc)}', info='${proxy.secure(e.info)}', giacenza='${proxy.secure(e.giacenza)}', prezzoEur='${proxy.secure(parseInt(("" + e.costo).split('.')[0]))}', prezzoCents='${proxy.secure(cents)}', gruppo='${proxy.secure(e.gruppo.value)}', details='${proxy.secure(e.detail.value)}'`, (err1, res1) => {
                    console.log(err1);
                });
            }
        )
        ;

    proxy.send({state: true});
}
;