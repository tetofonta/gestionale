const express = require('express');
const {getNW} = require('./network');
const fs = require('fs');
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
const {auth, auth_refresh} = require('./auth');
const {usr_getList, usr_edit, usr_new, usr_del, usr_getAccessibleFunctions} = require('./users');
const {get_most_suitable_ads} = require("./ads");
const {get_products_list, get_gruppi_cucina, get_popups, get_products, add_meals} = require("./magazzino");
const {increment, get_buono_detail, get_buoni, upd_buoni, get_old_orders, get_all_fncs} = require("./administration");
const cfg = require("./network.config");
const {logger_init} = require("./logger");
logger_init("./log/express.error.log", "./log/express.log");

let privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
let credentials = {key: privateKey, cert: certificate};
const app = express();
app.use(require('cors')());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(express.static('static'));

const GUEST = "guest";
const OP = "client";
const debug = false;

function POSTOnly(req, res, callback){
    if(req.method !== "POST") res.send({state: false, err: "wrong method"});
    else callback(req, res);
}

app.get('/api/hello', (req, res) => {
    if (debug) {
        console.log("Conn type: ");
        console.log(getNW(req) ? OP : GUEST);
        console.log((req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0]);
    }
    res.send({express: true, kind: getNW(req) ? OP : GUEST});
});
app.get('/api/ip', (req, res) => {
   return (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
});
app.get('/api/ads', (r, e) => get_most_suitable_ads(r, e));
app.get('/api/products', (r, e) => get_products_list(r, e));
app.get('/api/getAllFncs', (r, e) => get_all_fncs(r, e));


app.post('/api/new_order', (r, e) => POSTOnly(r, e, increment)); //Ritorna il numero di ordine incrementale
app.post('/api/rst_counter'); //TODO
app.post('/api/shutdown'); //TODO
app.post('/api/stats'); //TODO
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

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(cfg.serverPort, () => console.log(`Listening on port ${cfg.serverPort}`));

const redirect_app = express();
redirect_app.get('*', (req, res) => res.redirect('https://' + req.headers.host + ":" + cfg.serverPort + req.url));
let httpServer = http.createServer(redirect_app);
httpServer.listen(cfg.serverPortHttp, () => console.log(`Listening on port ${cfg.serverPortHttp}`));