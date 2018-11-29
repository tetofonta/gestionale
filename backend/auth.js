const {getNW} = require('./network');
const srs = require('secure-random-string');
const {getConnection, secure} = require('./mysql');
const user_association = new Map();
const crypto = require('crypto');

function getNewToken() {
    return srs({length: 148});
}

function getUsers(){
    return user_association
}

function onUserAuthenticated(req, res, cb, permitGuest = false){
    if (getNW(req) || permitGuest) {

        let data = req.body;
        try {
            data.user = secure(data.user);
            data.token = secure(data.token);
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

        if(cb) cb(data);
        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

function auth(req, res) {
    if (getNW(req)) {

        let data = req.body;
        data.user = secure(data.user);
        let shasum = crypto.createHash('sha1');
        shasum.update(data.psw);
        let hpsw =  shasum.digest('hex');

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
module.exports.onUserAuthenticated = onUserAuthenticated;
module.exports.auth_refresh = auth_refresh;
module.exports.getUsers = getUsers