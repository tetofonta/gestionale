const {getNW} = require('./network');
const {getConnection, secure} = require('./mysql');
const user_association = new Map();
const crypto = require('crypto');
const request = require("request");
const cfg = require("./network.config");

/**
 * Esegue cb(data) se l'utente é loggato correttamente
 * @param req express request obj
 * @param res express response obj
 * @param cb function cb(data): callback. data: oggetto della richiesta
 * @param neededPrivs undefined per non avere restrizioni sulle credenziali, altrimenti ["<req1>", "<req2>, ...]
 * @param permitGuest bool, permesso alla rete guest.
 * @requires POST, {user: String, token: String, <key>: <value>, ..., ...}
 * @return JSON, {state: bool, err: String} in caso di errore, altrimenti é compito di cb(data) scrivere sull'oggetto res.
 */
function onUserAuthenticated(req, res, cb, neededPrivs, permitGuest = false) {
    if (getNW(req)) {

        let data = req.body;
        try {
            if(!data.user || !data.token){
                res.send({state: false, err: "Insufficent data"});
                return;
            }
            data.user = secure(data.user);
            data.token = secure(data.token);
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        request.post({
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            url: `http://${cfg.managerIP}:${cfg.managerPort}/api/getUserState`,
            body: JSON.stringify({user: data.user, token: data.token, neededPrivs: neededPrivs})
        }, (err, resp, body) => {
            body = JSON.parse(body);
            if(body.state){
                data.token = undefined;
                data.neededPrivs = undefined;
                if (cb) cb(data);
            } else res.send(body);
        });

        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

module.exports.onUserAuthenticated = onUserAuthenticated;