const {getNW} = require("./network");
const crypto = require('crypto');
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const http = require("http");
const request = require("request");
const querystring = require("querystring");
const cfg = require("./network.config");


module.exports.callback = function (req, res) {
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
            if (!r || e) {
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
    }, ["STORICO"])
}