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
const {increment, get_buono_detail, get_buoni, upd_buoni, get_old_orders} = require("./administration");
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

app.get('/api/hello', (req, res) => {
    if (debug) {
        console.log("Conn type: ");
        console.log(getNW(req) ? OP : GUEST);
        console.log((req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0]);
    }
    res.send({express: true, kind: getNW(req) ? OP : GUEST});
});
app.post('/api/new_order', (r, e) => increment(r, e)); //Ritorna il numero di ordine incrementale
app.post('/api/rst_counter'); //TODO
app.post('/api/shutdown'); //TODO
app.post('/api/stats'); //TODO
app.post('/api/auth', (r, e) => auth(r, e));
app.post('/api/refresh', (r, e) => auth_refresh(r, e));
app.post('/api/userList', (r, e) => usr_getList(r, e));
app.post('/api/editUser', (r, e) => usr_edit(r, e));
app.post('/api/newUser', (r, e) => usr_new(r, e));
app.post('/api/delUser', (r, e) => usr_del(r, e));
app.post('/api/getfunctions', (r, e) => usr_getAccessibleFunctions(r, e));
app.post('/api/ads', (r, e) => get_most_suitable_ads(r, e));
app.post('/api/products', (r, e) => get_products_list(r, e));
app.post('/api/buono', (r, e) => get_buono_detail(r, e));
app.post('/api/buoni', (r, e) => get_buoni(r, e));
app.post('/api/updateBuoni', (r, e) => upd_buoni(r, e));
app.post('/api/gruppiCucina', (r, e) => get_gruppi_cucina(r, e));
app.post('/api/popups', (r, e) => get_popups(r, e));
app.post('/api/getProducts', (r, e) => get_products(r, e));
app.post('/api/addMeals', (r, e) => add_meals(r, e));
app.post('/api/getStorico', (r, e) => get_old_orders(r, e));

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(cfg.serverPort, () => console.log(`Listening on port ${cfg.serverPort}`));

const redirect_app = express();
app.get('*', (req, res) => res.redirect('https://' + req.headers.host + ":" + cfg.serverPort + req.url));
let httpServer = http.createServer(redirect_app);
httpServer.listen(cfg.serverPort + 1, () => console.log(`Listening on port ${cfg.serverPort + 1}`));