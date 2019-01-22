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
            field: "label",
            required: true,
            type: "text",
            strict: false
        },
        {
            field: "image",
            required: true,
            type: "text",
            strict: false
        },
    ]
}];

module.exports.callback = function (proxy) {
    if (proxy.recv.modified)
        proxy.recv.modified.forEach(e => {
            proxy.getConnection().query(`INSERT INTO gruppi_cucina(id, nome, bg) VALUES('${proxy.secure(e.value)}', '${proxy.secure(e.label)}', '${proxy.secure(e.image)}') ON DUPLICATE KEY UPDATE id='${proxy.secure(e.value)}', nome='${proxy.secure(e.label)}', bg='${proxy.secure(e.image)}'`, (e, r) => {
                console.log(e);
            });
        });

    proxy.send({state: true});
};
