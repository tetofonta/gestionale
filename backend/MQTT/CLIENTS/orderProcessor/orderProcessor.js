const mqtt = require('mqtt');
const cfg = require("../../../network.config");
const {getConnection, secure} = require("../../../mysql");
const {logger_init} = require("../../../logger");
logger_init("./log/processor.error.log", "./log/processor.log");

let client = mqtt.connect(`mqtt://${cfg.serverIP}:${cfg.mqtt.broker.port}`);

client.on('connect', function () {
    client.subscribe(cfg.mqtt["order-official"], err => {
        if (err) {
            console.log(err)
        }
    })
});

client.on('message', function (topic, message, packet) {
    if (topic === cfg.mqtt["order-official"]) {

        let cart = JSON.parse(message.toString());

        let arr = [];
        Object.keys(cart.cart).forEach(e => arr.push(...cart.cart[e]));
        cart.cart = arr;
        if(cart.reprint) return;
        if(cart.buono)
            getConnection().query(`UPDATE cupons SET usato=${cart.time} WHERE id=${cart.buonoID}`, (e) => {if(e) console.error(e)});


        getConnection().query(`INSERT INTO ordini_dettagli(timestamp, id_distict, ordnum, message, asporto, client, user) VALUES (${cart.time}, '${secure(cart.orderID)}', '${secure(cart.ordnum)}', '${secure(cart.message)}', ${cart.asporto ? 1 : 0}, '${secure(cart.ip)}', '${secure(cart.user)}')`, (e) => {
            if(e) console.error(e);
            else {
                getConnection().query(`SELECT LAST_INSERT_ID() as last;`, (e, r) => {
                    let oid;
                    if(r) oid = r[0].last;
                    if(e){ console.error(e); oid = -200}
                    let hasErrored = false;
                    cart.cart.forEach(elem => {
                        if(!hasErrored) getConnection().query(`INSERT INTO ordini_prodotti(\`order\`, product, variant, qta) VALUES (${oid}, ${elem[1].id}, '${secure(elem[1].variants ? JSON.stringify(elem[1].variants) : "NULL")}', ${elem[1].qta})`, (e) => {if(e){console.error(e); hasErrored = true}});
                        if(!hasErrored) getConnection().query(`UPDATE magazzino SET giacenza = giacenza - ${elem[1].qta} WHERE id = ${elem[1].id}`, (e) => {if(e){console.error(e); hasErrored = true}});
                    })
                })
            }
        });
    }
});
