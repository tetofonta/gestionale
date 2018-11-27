const express = require('express');
const {getNW} = require('./network');
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser');
const path = require('path');

const {auth, auth_refresh} = require('./auth');
const {usr_getList, usr_edit, usr_new, usr_del, usr_getAccessibleFunctions} = require('./users');
const {get_most_suitable_ads} = require("./ads");
const {get_products_list} = require("./magazzino");
const {increment, get_buono_detail} = require("./administration");


let privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

let credentials = {key: privateKey, cert: certificate};

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static('static'));
const port = process.env.PORT || 5000;

const GUEST = "guest";
const OP = "client";
const debug = false;

app.get('/api/hello', (req, res) => {
    if(debug) {
        console.log("Conn type: ");
        console.log(getNW(req) ? OP : GUEST);
        console.log((req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0]);
    }
    res.send({express: true, kind: getNW(req) ? OP : GUEST});
});

app.post('/api/new_order', (r, e) => increment(r,e)); //Ritorna il numero di ordine incrementale

app.post('/api/rst_counter');
app.post('/api/shutdown');
app.post('/api/stats');

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

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => console.log(`Listening on port ${port}`));