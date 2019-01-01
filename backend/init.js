const express = require('express');
const {getNW} = require('./network');
const fs = require('fs');
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const cfg = require("./network.config");
const {logger_init} = require("./logger");
const {stats} = require("./essential_module_stats");
const {mqttClient} = require("./lbClient");
const api = require("./api");


logger_init("./log/express.error.log", "./log/express.log");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
mqttClient(cfg.mqtt.broker.port, cfg.MQTTIP);


const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(express.static('static'));

const request_track = (callback) => (req, res) => {
    if (cfg.network.only_from_balanced) {
        if (req.headers[cfg.load_balancer.load_balanced_sign_header] && req.headers[cfg.load_balancer.load_balanced_sign_header] !== 'YUP') {
            res.send("NETWORK ERROR, Only Load Balanced.");
            return;
        }
    }
    let start = Date.now();
    callback(req, res);
    stats.get.times();
    stats.get.avg(Date.now() - start);
};

Object.keys(api.apicalls).forEach(e => {
    let obj = api.apicalls[e];
    if (!obj.enabled) return;
    let {callback} = require(`${obj.modulePath}`);
    if (obj.action === "GET") app.get(obj.url, request_track(callback));
    else if (obj.action === "POST") app.post(obj.url, request_track(callback));
    else {
        console.error(`Action ${obj.action} is not recognized nor implemented =(`);
        return;
    }
    console.log(`Loaded module "${e}" at "${obj.url}" (${obj.action})`);

});

// app.post('/api/getNetworkCreds', (r, e) => POSTOnly(r, e, generateCredentials));
// app.post('/api/loginnw', (r, e) => POSTOnly(r, e, loginnw));

if (cfg.network.use_ssl) {
    let privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
    let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    let credentials = {key: privateKey, cert: certificate};
    let server = https.createServer(credentials, app);
    server.listen(cfg.serverPort, () => console.log(`Listening on port ${cfg.serverPort}`));

    const redirect_app = express();
    redirect_app.get('*', (req, res) => {
        res.send(`<html><head><title>MOVED</title></head><body><a href="https://${cfg.serverIP}/">Vai alla pagina</a> <script>window.location.href = "https://${cfg.serverIP}/"</script></body></html>`)
    });
    let httpServer = http.createServer(redirect_app);
    httpServer.listen(cfg.serverPortHttp, () => console.log(`Listening on port ${cfg.serverPortHttp}`));
} else {
    let server = http.createServer(app);
    server.listen(cfg.serverPort, () => console.log(`Listening on port ${cfg.serverPort}`));
}