const {getNW} = require("./network");
const crypto = require('crypto');
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const http = require("http");
const request = require("request");
const querystring = require("querystring");
const cfg = require("./network.config");
const srs = require('secure-random-string');


module.exports.generateCredentials = function (req, res) {
    onUserAuthenticated(req, res, (data) => {

        let psw = srs({length: 10});
        let usr = srs({length: 10});
        let shasum = crypto.createHash('sha1'); shasum.update(psw);
        let hpsw = shasum.digest('hex');

        getConnection().query(`DELETE FROM credentials WHERE initiate < ${Math.floor(Date.now()/1000) - cfg.network.registration_timeout}`);
        getConnection().query(`INSERT INTO credentials(\`user\`, \`passw_hash\`, initiate) VALUES ('${secure(usr)}', '${secure(hpsw)}', ${Math.floor(Date.now()/1000)})`, (e, r) => {
            if(e) {
                res.send({state: false, err: e});
                return;
            }
            res.send({state: true, usr: usr, psw: psw});
            return;
        });

    }, ["CASSA"]);
};

module.exports.loginnw = function(req, res){
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    ip = ip.replace("::ffff:", "");
    let r = {
        client: ip,
        usr: req.body.usr,
        psw: req.body.psw
    };

    request.post({
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: `https://${cfg.loginIP}:${cfg.serverLoginPort}/api/login`,
        body: JSON.stringify(r)
    }, (err, resp, body) => {
        res.send(body)
    })
};