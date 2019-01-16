module.exports.auth_required = true;
module.exports.privs = ["AMMINISTRAZIONE"];

module.exports.format = [];

module.exports.callback = (proxy) => {
        proxy.getConnection().query(`SELECT id, \`desc\`, rank, image_src FROM ads;`, (e, r, f) => {
            if (!r || e) {
                proxy.send({state: false, err: e});
                return;
            }
            proxy.send({state: true, ret: r})
        })
};