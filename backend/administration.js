const {getNW}  = require("./network");
const crypto = require('crypto');
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection} = require("./mysql");

let currentno = 0;
let accessing = false;

/**
 * @userAuthenticated
 * Incrementa il contatore degli ordini restituendo il prossimo numero di ordine.
 * @param req express request obj
 * @param res express response obj
 * @requires POST, {user: String, token: String}
 * @return JSON, {state: bool, ordnum: Number}
 */
function increment(req, res) {
    onUserAuthenticated(req, res, () => {
        while(accessing);
        accessing = true;
        let no = currentno++;
        accessing = false;

        res.send({state: true, ordnum: no});
    });
}

/**
 * Ritorna i dati relativi al buono di id=req.body.id, letto dal database
 * @param req express request obj
 * @param res express response obj
 * @requires POST, {user: String, token: String, id: Number}
 * @return JSON, {state: bool, [state = false] err: String / [state = true] tipo: Number, valore: Number, minimo: Number}
 */
function get_buono_detail(req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT tipo, valore, minimo FROM cupons WHERE usato = 0 AND id = ${data.id}`, (e, r, f) => {
            if(r.length < 1){
                res.send({state: false, err: ""});
                return;
            }
            if(r && !e){
                res.send({state: true, tipo: r[0].tipo, valore: r[0].valore, minimo: r[0].minimo});
                return;
            }
            res.send({state: false, err: ""})
        });

    });
}

/**
 * @userAuthenticated
 * Ritorna i dati relativi a tutti i buoni, letto dal database
 * @param req express request obj
 * @param res express response obj
 * @requires POST, {user: String, token: String}
 * @return JSON, {state: bool, [state = false] err: String / [state = true] list: [{id: Number, tipo: Number, valore: Number, minimo: Number, usato: Number}, ...]}
 */
function get_buoni(req, res){
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, tipo, valore, minimo, usato FROM cupons WHERE 1 ORDER BY id ASC`, (e, r, f) => {
            if(r.length < 1){
                res.send({state: false, err: ""});
                return;
            }
            if(r && !e){
                res.send({state: true, list:r});
                return;
            }
            res.send({state: false, err: ""})
        });
    });
}

/**
 * @userAuthenticated
 * Aggiorna i dati relativi ai buoni
 * @param req express request obj
 * @param res express response obj
 * @requires POST, {user: String, token: String, modified: [{id: Number, tipo: Number, valore: Number, minimo: Number, usato: bool}, ...]}
 * @return 402
 */
function upd_buoni(req, res){
    onUserAuthenticated(req, res, (data) => {
        if(data.modified)
            data.modified.forEach(e => {
                getConnection().query(`INSERT INTO cupons(id, tipo, valore, minimo, usato) VALUES (${e.id}, ${e.tipo}, ${e.valore}, ${e.minimo}, ${e.usato ? 1 : 0}) ON DUPLICATE KEY UPDATE id=${e.id}, tipo=${e.tipo}, valore=${e.valore}, minimo=${e.minimo}, usato=${e.usato ? 1 : 0}`);
            });
    });
}

module.exports.increment = increment;
module.exports.get_buono_detail = get_buono_detail;
module.exports.get_buoni = get_buoni;
module.exports.upd_buoni = upd_buoni;
