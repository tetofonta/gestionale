const {getNW} = require("./network");
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
        while (accessing) ;
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
            if (r.length < 1) {
                res.send({state: false, err: ""});
                return;
            }
            if (r && !e) {
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
function get_buoni(req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, tipo, valore, minimo, usato FROM cupons WHERE 1 ORDER BY id ASC`, (e, r, f) => {
            if (r.length < 1) {
                res.send({state: false, err: ""});
                return;
            }
            if (r && !e) {
                res.send({state: true, list: r});
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
function upd_buoni(req, res) {
    onUserAuthenticated(req, res, (data) => {
        if (data.modified)
            data.modified.forEach(e => {
                getConnection().query(`INSERT INTO cupons(id, tipo, valore, minimo, usato) VALUES (${e.id}, ${e.tipo}, ${e.valore}, ${e.minimo}, ${e.usato ? 1 : 0}) ON DUPLICATE KEY UPDATE id=${e.id}, tipo=${e.tipo}, valore=${e.valore}, minimo=${e.minimo}, usato=${e.usato ? 1 : 0}`);
            });
    });
}

function get_old_orders(req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`select 
                                  ordini_dettagli.timestamp as time,
                                  ordini_dettagli.ordnum    as ordnum,
                                  ordini_dettagli.user      as user,
                                  ordini_dettagli.message   as msg,
                                  ordini_dettagli.asporto   as isAsporto,
                                  ordini_dettagli.client    as client,
                                  ordini_prodotti.variant   as variants,
                                  ordini_prodotti.qta       as qta,
                                  ordini_prodotti.product       as idp,
                                  ordini_dettagli.id_distict   as id,
                                  magazzino.descrizione     as \`desc\`,
                                  magazzino.prezzoCents     as cents,
                                  magazzino.prezzoEur       as eur,
                                  gruppi_cucina.nome        as grp
                            from ordini_dettagli, ordini_prodotti
                              inner join magazzino on ordini_prodotti.product = magazzino.id
                              inner join gruppi_cucina on magazzino.gruppo = gruppi_cucina.id
                            where ordini_dettagli.id = ordini_prodotti.\`order\` ORDER BY ordini_dettagli.timestamp ASC`, (e, r) => {
            if (!res || e) {
                console.error(e);
                res.send({state: false, err: e.toString()});
                return;
            }

            let orders = {};
            r.forEach(e => {
                if (!orders[e.id]) {
                    orders[e.id] = {};
                    orders[e.id].cart = [];
                    orders[e.id].time = e.time;
                    orders[e.id].ordnum = e.ordnum;
                    orders[e.id].message = e.msg;
                    orders[e.id].asporto = e.isAsporto !== 0;
                    orders[e.id].ip = e.client;
                    orders[e.id].totale = [0, 0];
                    orders[e.id].orderID = e.id;
                    orders[e.id].user = e.user;
                }
                let prod = {qta: e.qta, id: e.idp, cents: e.cents, eur: e.eur, cat: e.grp};
                if (e.variants !== 'NULL') prod.variants = JSON.parse(e.variants);
                orders[e.id].cart.push([e.desc, JSON.parse(JSON.stringify(prod))]);
                orders[e.id].totale[1] += e.cents;
                orders[e.id].totale[0] += e.eur + Math.floor(orders[e.id].totale[1] / 100);
                orders[e.id].totale[1] = Math.floor(orders[e.id].totale[1] / 100);
            });

            res.send({state: true, list: orders})
        })
    })
}

module.exports.get_old_orders = get_old_orders;
module.exports.increment = increment;
module.exports.get_buono_detail = get_buono_detail;
module.exports.get_buoni = get_buoni;
module.exports.upd_buoni = upd_buoni;
