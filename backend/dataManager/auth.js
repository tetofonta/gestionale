const {getConnection, secure} = require("../mysql");
const srs = require('secure-random-string');
const cfg = require("../network.config");
const user_association = new Map();
const crypto = require('crypto');

/**
 * @return stringa alfanumerica casuale di 148 caratteri
 */
function getNewToken() {
    return srs({length: 148});
}


function auth(req, res) {
    let data = req.body;
    if (!data.user || !data.psw) {
        res.send({state: false, err: "Insufficent data"});
        return;
    }
    data.user = secure(data.user);
    let shasum = crypto.createHash('sha1');
    shasum.update(data.psw);
    // noinspection JSCheckFunctionSignatures
    let hpsw = shasum.digest('hex');

    getConnection().query(`SELECT name AS nome, MIN(secure) AS sec, MIN(admin) AS admin, GROUP_CONCAT(DISTINCT previlegi.description) AS privs FROM utenti, utenti_previlegi_assoc INNER JOIN previlegi on utenti_previlegi_assoc.previlegi_FOREGIN = previlegi.id WHERE  username='${secure(data.user)}' AND password='${hpsw}' AND enabled=1 AND utenti_previlegi_assoc.utenti_FOREGIN = utenti.id GROUP BY name;`, function (error, results, fields) {
        if (results && results.length === 1 && !error) {
            let finalstate = results[0].sec;
            if (data.user === data.psw || data.psw === "admin" || data.user === "root") finalstate = 1; //TODO: LE PASSWORD SONO IN SHA1 COGLIONE!!!
            let tok = getNewToken();
            user_association.set(data.user, {token: tok, privs: results[0].privs.split(",")});
            res.send({
                state: true,
                token: tok,
                username: data.user,
                name: results[0].nome,
                secure: results[0].sec,
                isAdmin: results[0].admin
            });
            return;
        }
        error && console.log(error);
        res.send({state: false, err: "Access denied."})
    });
}

function auth_refresh(req, res) {
    let user = user_association.get(req.body.username);
    if (user && user.token === req.body.token) {
        let tok = getNewToken();
        user.token = tok;
        res.send({state: true, token: tok});
        return;
    }

    res.send({state: false, err: 'User was not logged in.'});
}

function get_user_state(req, res) {
    let data = req.body;
    let userData = user_association.get(data.user);
    if (!userData || userData.token !== data.token) {
        res.send({state: false, err: "Access denied."});
        return;
    }

    if (data.neededPrivs && !data.neededPrivs.every(v => userData.privs.includes(v))) {
        res.send({state: false, err: "Not enough permissions"});
        return;
    }

    res.send({state: true});
}

module.exports.auth = auth;
module.exports.auth_refresh = auth_refresh;
module.exports.get_user_state = get_user_state;
