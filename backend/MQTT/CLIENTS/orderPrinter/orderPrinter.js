const mqtt = require('mqtt');
const cfg = require("../../../network.config");
const model = require("./model");
const {Scontrino} = require("./Scontrino");
const fs = require('fs');
const flatten = require('flatten');
const {execFile} = require('child_process');
const {logger_init} = require("../../../logger");
logger_init("./log/printer.error.log", "./log/printer.log");

let client = mqtt.connect(`mqtt://${cfg.MQTTIP}:${cfg.mqtt.broker.port}`);

client.on('connect', function () {
    client.subscribe(cfg.mqtt["order-official"], err => {
        if (err) {
            console.error(err)
        }
    })
});

client.on('message', function (topic, message, packet) {
    if (topic === cfg.mqtt["order-official"]) {
        let cart = JSON.parse(message.toString());
        console.log(cart);
        let cartArray = [];
        cfg.toPrinter.forEach(e => cartArray.push(...cart.cart[e]));

        let mymsg = cart.message;
        let msg = mymsg.length;
        let ourmsg = "";
        let i = 0;
        for (msg; msg > 0 && i < 5; msg -= 69, i++) {
            ourmsg += mymsg.substr(mymsg.length - msg, 69) + "-\n";
        }

        let scontrino = new Scontrino(undefined,
            {
                asporto: cart.asporto ? 'ASPORTO' : ' ',
                id: cart.orderID,
                message: ourmsg,
                time: cart.time,
                ordnum: cart.ordnum
            },
            flatten(cartArray.map(v => {
                if (!v[1].variants)
                    return {text: v[0], qta: v[1].qta};

                return v[1].variants.map(e => {
                    let text = v[0] + " ";
                    if (e.var.select && e.var.select.values && e.var.select.labels)
                        e.var.select.labels.forEach((q, i) => text += (e.var.select.values[i] ? "CON " : "NO ") + q + ", ");
                    else
                        text += e.var.choose;

                    return {text: text, qta: e.qta}
                });

            })),
            cart.ordnum,
            model);

        fs.writeFile(`./orders/${cart.ordnum}_${cart.orderID}_${cart.time}.pdf`, scontrino.getDoc().output(), function (err) {
            if (err) console.error(err);
            else
                execFile("lpr", ["-P", cfg.printerName, `./orders/${cart.ordnum}_${cart.orderID}_${cart.time}.pdf`], function (e, o, ecode) {
                    if (e) console.error(e);
                    console.log(o + "EXIT " + ecode)
                })
        });
    }
});
