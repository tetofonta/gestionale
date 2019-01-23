module.exports.auth_required = true;
module.exports.privs = ["MAGAZZINO"];

module.exports.format = [{
    field: "modified",
    required: true,
    type: "array",
    inner: [
        {
            field: "value",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "json",
            required: true,
            type: "object",
            strict: false
        },
        {
            field: "type",
            required: true,
            type: "text",
            strict: false
        },
    ]
}];

module.exports.callback = function (proxy) {
    if (proxy.recv.modified)
        proxy.recv.modified.forEach(e => {
            let json = JSON.stringify(e.json).replaceAll("'", "");

            if (e.type === 'select')
                json = json.replace('choose', 'select');
            else if (e.type === 'choose')
                json = json.replace('select', 'choose');

            proxy.getConnection().query(`INSERT INTO details(id, json, human_dec) VALUES('${proxy.secure(e.value)}', '${json}', NULL) ON DUPLICATE KEY UPDATE id='${proxy.secure(e.value)}', json='${json}', human_dec=NULL`, (e, r) => {
                console.log(e);
            });
        });

    proxy.send({state: true});
};
