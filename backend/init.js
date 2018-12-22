const express = require('express');
const {getNW} = require('./network');
const fs = require('fs');
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const {auth, auth_refresh} = require('./auth');
const {usr_getList, usr_edit, usr_new, usr_del, usr_getAccessibleFunctions, feedback, savefeed} = require('./users');
const {get_most_suitable_ads, get_ads, edit_ads, delete_ads} = require("./ads");
const {get_products_list, get_gruppi_cucina, get_popups, get_products, add_meals} = require("./magazzino");
const {increment, get_buono_detail, get_buoni, upd_buoni, get_old_orders, get_all_fncs, operateNo} = require("./administration");
const cfg = require("./network.config");
const {logger_init} = require("./logger");
const {get_stats, stats} = require("./stats");
const {mqttClient} = require("./lbClient");
logger_init("./log/express.error.log", "./log/express.log");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
mqttClient(cfg.mqtt.broker.port, cfg.MQTTIP);

let privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
let credentials = {key: privateKey, cert: certificate};
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(express.static('static'));

const GUEST = "guest";
const OP = "client";
const debug = false;

function GETOnly(req, res, callback) {
    if(cfg.network.only_from_balanced){
        if(req.headers[cfg.load_balancer.load_balanced_sign_header] && req.headers[cfg.load_balancer.load_balanced_sign_header] !== 'YUP'){
            res.send("NETWORK ERROR, Only Load Balanced.");
            return;
        }
    }
    let start = Date.now();
    callback(req, res);
    stats.get.times();
    stats.get.avg(Date.now() - start);
}

function POSTOnly(req, res, callback) {
    if(cfg.network.only_from_balanced){
        if(req.headers[cfg.load_balancer.load_balanced_sign_header] && req.headers[cfg.load_balancer.load_balanced_sign_header] !== 'YUP'){
            res.send("NETWORK ERROR, Only Load Balanced.");
            return;
        }
    }
    let start = Date.now();
    if (req.method !== "POST"){
        res.send({state: false, err: "wrong method"});
        return;
    }
    else callback(req, res);
    stats.post.times();
    stats.post.avg(Date.now() - start);
}

app.get('/_*', (req, res) => {
    res.sendFile(path.join('/static/index.html', { root: cfg.static_root }));
});

app.get('/api/hello', (req, res) => GETOnly(req, res, function () {
    if (debug) {
        console.log("Conn type: ");
        console.log(getNW(req) ? OP : GUEST);
        console.log((req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0]);
    }
    res.send({express: true, kind: getNW(req) ? OP : GUEST});
}));
app.get('/api/ip', (req, res) => GETOnly(req, res, function () {
    res.send({ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0]});
}));
app.get('/api/ads', (r, e) => GETOnly(r, e, get_most_suitable_ads));
app.get('/api/products', (r, e) => GETOnly(r, e, get_products_list));
app.get('/api/getAllFncs', (r, e) => GETOnly(r, e, get_all_fncs));
app.get('/api/getFeedback', (r, e) => GETOnly(r, e, feedback));
app.post('/api/sendFeed', (r, e) => POSTOnly(r, e, savefeed));
app.post('/api/new_order', (r, e) => POSTOnly(r, e, increment)); //Ritorna il numero di ordine incrementale
app.post('/api/shutdown'); //TODO
app.post('/api/auth', (r, e) => POSTOnly(r, e, auth));
app.post('/api/refresh', (r, e) => POSTOnly(r, e, auth_refresh));
app.post('/api/userList', (r, e) => POSTOnly(r, e, usr_getList));
app.post('/api/editUser', (r, e) => POSTOnly(r, e, usr_edit));
app.post('/api/newUser', (r, e) => POSTOnly(r, e, usr_new));
app.post('/api/delUser', (r, e) => POSTOnly(r, e, usr_del));
app.post('/api/getfunctions', (r, e) => POSTOnly(r, e, usr_getAccessibleFunctions));
app.post('/api/buono', (r, e) => POSTOnly(r, e, get_buono_detail));
app.post('/api/buoni', (r, e) => POSTOnly(r, e, get_buoni));
app.post('/api/updateBuoni', (r, e) => POSTOnly(r, e, upd_buoni));
app.post('/api/gruppiCucina', (r, e) => POSTOnly(r, e, get_gruppi_cucina));
app.post('/api/popups', (r, e) => POSTOnly(r, e, get_popups));
app.post('/api/getProducts', (r, e) => POSTOnly(r, e, get_products));
app.post('/api/addMeals', (r, e) => POSTOnly(r, e, add_meals));
app.post('/api/getStorico', (r, e) => POSTOnly(r, e, get_old_orders));
app.post('/api/getStats', (r, e) => POSTOnly(r, e, get_stats));
app.post('/api/getAds', (r, e) => POSTOnly(r, e, get_ads));
app.post('/api/editAds', (r, e) => POSTOnly(r, e, edit_ads));
app.post('/api/delAds', (r, e) => POSTOnly(r, e, delete_ads));
app.post('/api/operate', (r, e) => POSTOnly(r, e, operateNo));

if(cfg.network.use_ssl){
    let server = https.createServer(credentials, app);
    server.listen(cfg.serverPort, () => console.log(`Listening on port ${cfg.serverPort}`));

    const redirect_app = express();
    redirect_app.get('*', (req, res) => {
        res.send(`<html><head><title>MOVED</title></head><body><a href="https://' + ${req.headers.host.substr(0, req.headers.host.indexOf(":"))}:${cfg.serverPort + req.url}">Vai alla pagina</a></body></html>`)
    });
    let httpServer = http.createServer(redirect_app);
    httpServer.listen(cfg.serverPortHttp, () => console.log(`Listening on port ${cfg.serverPortHttp}`));
} else {
    let server = http.createServer(app);
    server.listen(cfg.serverPort, () => console.log(`Listening on port ${cfg.serverPort}`));
}