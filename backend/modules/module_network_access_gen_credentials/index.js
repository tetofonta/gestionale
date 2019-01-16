const crypto = require('crypto');
const srs = require('secure-random-string');

module.exports.auth_required = true;
module.exports.privs = ["CASSA"];

module.exports.format = [];

module.exports.callback = function (proxy) {
    let psw = srs({length: 10});
    let usr = srs({length: 10});
    let shasum = crypto.createHash('sha1');
    shasum.update(psw);
    let hpsw = shasum.digest('hex');

    proxy.getConnection().query(`DELETE FROM credentials WHERE initiate < ${Math.floor(Date.now() / 1000) - proxy.cfg.network.registration_timeout}`);
    proxy.getConnection().query(`INSERT INTO credentials(\`user\`, \`passw_hash\`, initiate) VALUES ('${proxy.secure(usr)}', '${proxy.secure(hpsw)}', ${Math.floor(Date.now() / 1000)})`, (e, r) => {
        if (e) {
            proxy.send({state: false, err: e});
            return;
        }
        proxy.send({state: true, usr: usr, psw: psw});
        return;
    });

};