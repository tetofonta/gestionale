const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const http = require('http');
const request = require('request');
const cfg = require("../network.config");
const {logger_init} = require("../logger");
const crypto = require('crypto');
const fs = require('fs');
const mqtt = require("mqtt");

logger_init("./log/balancer.error.log", "./log/balancer.log");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

let hosts = {};

let client = mqtt.connect(`mqtt://${cfg.MQTTIP}:${cfg.mqtt.broker.port}`);
client.on('connect', function () {
    client.subscribe(cfg.mqtt.load_send);
    client.subscribe(cfg.mqtt.load_access);
    client.on("message", function (topic, message, packet) {
        let msg = JSON.parse(message.toString());
        console.log(msg);
        switch (topic) {
            case cfg.mqtt.load_send:
                if (hosts[msg.sender.address]) {
                    hosts[msg.sender.address] = {load: msg.load, date: Date.now()};
                    console.log("updated load for " + msg.sender.address + " with " + msg.load)
                }
                break;
            case cfg.mqtt.load_access:
                if (cfg.load_balancer.allowed_hosts.includes(msg.sender.address)) {
                    hosts[msg.sender.address] = {load: msg.load, date: Date.now()};
                    console.log("Connected webserver at " + msg.sender.address + " with standard load of " + msg.load)
                }
                break;
        }
    })
});

let privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
let credentials = {key: privateKey, cert: certificate};
const listen = express();
listen.use(bodyParser.json()); // support json encoded bodies
listen.use(bodyParser.urlencoded({extended: true})); // support encoded bodies


const handler = (reqFnc) => (req, res) => {
    if (req.get(cfg.load_balancer.load_balanced_sign_header)) {
        res.send("NETWORK ERROR, Already Load Balanced.");
        return;
    }

    let ip = Object.keys(hosts).reduce((a, v) => {
        if (typeof a === 'undefined') return v;
        if(Date.now() - hosts[v].date > cfg.load_balancer.timeout * 1000){
            hosts[v].load = 101;
            return a;
        }
        if (hosts[a] > hosts[v]) return v;
        return a;
    });

    let o = {};
    if(cfg.load_balancer.log_packets){
        cfg.load_balancer.log_filter.forEach(e => {
            switch (e){
                case "client":
                    o.client = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
                    break;
                case "header":
                    o.header = req.headers;
                    break;
                case "body":
                    o.body = req.body;
                    break;
                default:
                    console.error("Unregognized entry in log_filter: " + e);
            }
        })
    }

    let oldh = req.headers;
    oldh[cfg.load_balancer.load_balanced_sign_header] = 'YUP';
    oldh['x-forwarded-for'] = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];

    const _rq = reqFnc({
        url: (cfg.network.use_ssl ? "https://" : "http://") + ip + ":" + cfg.serverPort + req.url,
        headers: oldh,
        body: JSON.stringify(req.body)
    }).on('error', error => {
        console.error(error)
    }).on('data', (chunk) => {
        if(cfg.load_balancer.log_packets && cfg.load_balancer.log_filter.includes("response")){
            if(!o.res) o.res = "";
            o.res += chunk;
        }
    }).on('end', () => {
        if(cfg.load_balancer.log_packets) console.log(o);
    });

    _rq.pipe(res);
};

listen.get("*", handler(request));
listen.post("*", handler(request.post));

if (cfg.network.lb_use_ssl) {
    let server = https.createServer(credentials, listen);
    server.listen(cfg.loadBalancerPort, () => console.log(`Listening on port ${cfg.loadBalancerPort}`));

    const redirect_app = express();
    redirect_app.get('*', (req, res) => {
        res.send(`<html><head><title>MOVED</title></head><body><a href="https://' + ${req.headers.host.substr(0, req.headers.host.indexOf(":"))}:${cfg.serverPort + req.url}">Vai alla pagina</a></body></html>`)
    });
    let httpServer = http.createServer(redirect_app);
    httpServer.listen(cfg.loadBalancerPortHttp, () => console.log(`Listening on port ${cfg.loadBalancerPortHttp}`));
} else {
    let server = http.createServer(listen);
    server.listen(cfg.loadBalancerPort, () => console.log(`Listening on port ${cfg.loadBalancerPort}`));
}
