const mqtt = require('mqtt');
const cfg = require("../../../network.config");
const {getConnection, secure} = require("../../../mysql");
const {logger_init} = require("../../../logger");
logger_init("./log/stats.error.log", "./log/stats.log");

let client = mqtt.connect(`mqtt://${cfg.serverIP}:${cfg.mqtt.broker.port}`);

client.on('connect', function () {
    client.subscribe(cfg.mqtt.track, err => {
        if (err) console.error(err)
    });
});

client.on('message', function (topic, message, packet) {
    console.log(message.toString());
});
