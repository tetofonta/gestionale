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
const {onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const {mqttClient} = require("./lbClient");
const api = require("./modules/built/api");


logger_init("./log/express.error.log", "./log/express.log");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
mqttClient(cfg.mqtt.broker.port, cfg.MQTTIP);


const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(express.static('static'));

function getType(element){
    if(Array.isArray(element)) return "array";
    return typeof(element);
}

function checkFormat(def, req){
    for(let element in def){
        if(typeof(element.strict) === "undefined") element.strict = true;
        if(!req[element.field] && element.required){
            console.error(`requiring ${element.field} but not getting it`);
            return false;
        }
        if(req[element.field]){
            if(getType(req[element.field]) !== element.type && element.strict){
                console.error(`element ${element.field} is of type ${typeof(req[element.field])} but required is ${element.type}`);
                return false;
            }
            if(element.type === "array" && element.inner) return checkFormat(element.inner, req[element.field])
        }
    }
    return true;
}

const request_track = (plugin, type) => (req, res) => {
    if (cfg.network.only_from_balanced) {
        if (req.headers[cfg.load_balancer.load_balanced_sign_header] && req.headers[cfg.load_balancer.load_balanced_sign_header] !== 'YUP') {
            res.send("NETWORK ERROR, Only Load Balanced.");
            return;
        }
    }

    if(plugin.format && plugin.auth_required){
        plugin.format.push({field: "user", type: "string", required: true});
        plugin.format.push({field: "token", type: "string", required: true});
    }

    if(plugin.format && ! checkFormat(plugin.format, req.body)){
        res.send({state: false, err: "dati non conformi"});
        return;
    }

    let proxy = {
        recv: req.body,
        req: req,
        res: res,

        send: (data) => res.send(data),

        getConnection: getConnection,
        secure: secure,

        cfg: cfg,
        getNW: () => getNW(req),
        _ifAuthOk: onUserAuthenticated
    };

    let start = Date.now();

    if(plugin.auth_required)
        onUserAuthenticated(proxy, plugin.callback, plugin.privs);
    else plugin.callback(proxy);

    if(type === "GET"){
        stats.get.times();
        stats.get.avg(Date.now() - start);
    } else {
        stats.post.times();
        stats.post.avg(Date.now() - start);
    }

};

Object.keys(api.apicalls).forEach(e => {
    let obj = api.apicalls[e];
    if (!obj.enabled) return;
    let plugin = require(`${obj.modulePath}`);

    if (obj.action === "GET") app.get(obj.url, request_track(plugin, "GET"));
    else if (obj.action === "POST") app.post(obj.url, request_track(plugin, "POST"));
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