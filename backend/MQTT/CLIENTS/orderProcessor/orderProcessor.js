const mqtt = require('mqtt');
const cfg = require("../../../network.config");
const model = require("./model");
const {Scontrino} = require("./Scontrino");
const fs = require('fs');

let client = mqtt.connect(`mqtt://${cfg.serverIP}:${cfg.mqtt.broker.port}`);

client.on('connect', function () {
    client.subscribe('order/official', err => {
        if (err) {
            console.log(err)
        }
    })
});

client.on('message', function (topic, message, packet) {
    if(topic === "order/official"){
        console.log(message.toString())
    }
});
//
// let s = new Scontrino(undefined, {ordnum: 0, descrizione: "lolololol", importo: 36, minimo: 11, emesso: Date.now()}, [], 0, model);
// fs.writeFileSync('./document.pdf', s.getDoc().output());
