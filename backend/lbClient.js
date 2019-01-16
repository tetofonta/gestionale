const mqtt = require("mqtt");
const os = require('os-utils');
const cfg = require("./network.config");

module.exports.mqttClient = function (port, ip) {
    let client = mqtt.connect(`mqtt://${ip}:${port}`);
    client.on('connect', function () {
        os.cpuUsage(function (v) {
            client.publish(cfg.mqtt.load_access, JSON.stringify({
                load: v
            }))
        });
        setInterval(() => {
            os.cpuUsage(function (v) {
                client.publish(cfg.mqtt.load_send, JSON.stringify({
                    load: v
                }))
            });
        }, cfg.load_balancer.load_intervals * 1000)
    })
};