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
    ]
}];


module.exports.callback = function (proxy) {
    console.log(proxy.recv)

    if (proxy.recv.modified)
        proxy.recv.modified.forEach(e => {
            proxy.getConnection().query(`DELETE FROM gruppi_cucina WHERE id=${proxy.secure(e)}`, (e, r) => {
                console.log(e)
            });
        });

    proxy.send({state: true})
};