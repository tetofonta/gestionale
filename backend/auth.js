const {getNW} = require('./network');
const srs = require('secure-random-string');
const {getConnection} = require('./mysql');
const user_association = new Map();
const crypto = require('crypto');

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function getNewToken() {
    return srs({length: 148});
}

function auth(req, res) {
    if (getNW(req)) {

        let data = req.body;
        data.user = data.user.replaceAll("'", "");
        let shasum = crypto.createHash('sha1');
        shasum.update(data.psw);
        let hpsw =  shasum.digest('hex');

        console.log(hpsw);

        getConnection().query(`SELECT name AS nome, secure AS sec, admin FROM utenti WHERE username='${data.user}' AND password='${hpsw}' AND enabled=1;`, function (error, results, fields) {
            if(results && results.length === 1 && !error){
                let finalstate = results[0].sec;
                if(data.user === data.psw || data.psw === "admin" || data.user === "root") finalstate = 1; //TODO: LE PASSWORD SONO IN SHA1 COGLIONE!!!
                let tok = getNewToken();
                user_association.set(data.user, tok);
                res.send({state: true, token: tok, username: data.user, name: results[0].nome, secure: results[0].sec, isAdmin: results[0].admin});
                return;
            }
            error && console.log(error);
            res.send({state: false, err: "Access denied."})
        });
        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

function auth_refresh(req, res) {
    if (getNW(req)) {
        let user = user_association.get(req.body.username);
        console.log(user);
        console.log(req.body.token);
        if (typeof(user) !== 'undefined' && user === req.body.token) {
            let tok = getNewToken();
            user_association.set(req.body.username, tok);
            res.send({state: true, token: tok});
            return;
        }

        res.send({state: false, err: 'User was not logged in.'});
        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

module.exports.auth = auth;
module.exports.auth_refresh = auth_refresh;
module.exports.getUsers = () => {return user_association};