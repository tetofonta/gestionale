module.exports.auth_required = true;
module.exports.privs = ["AMMINISTRAZIONE"];

module.exports.format = [{
    field: "id",
    required: true,
    type: "number",
    strict: false
}];

module.exports.callback = (proxy) => {
        proxy.getConnection().query(`DELETE FROM ads WHERE id = ${proxy.secure(proxy.recv.id)}`)
};