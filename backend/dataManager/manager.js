const {getConnection, secure} = require("../mysql");
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const srs = require('secure-random-string');
const cfg = require("../network.config");
const bodyParser = require('body-parser');
const {logger_init} = require("../logger");
const crypto = require('crypto');
const {auth, auth_refresh, get_user_state} = require("./auth");
const {operateNo, increment} = require("./orders");

const user_association = new Map();
logger_init("./log/counter.error.log", "./log/counter.log");

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

app.post("/api/operate", operateNo);
app.get("/api/getNext", increment);
app.post('/api/auth', auth);
app.post('/api/refresh', auth_refresh);
app.post('/api/getUserState', get_user_state);

app.get("/", (req, res) => {
    res.send("ALIVE")
});

if (cfg.network.manager_use_ssl) {
    let privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
    let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    let credentials = {key: privateKey, cert: certificate};
    let server = https.createServer(credentials, app);
    server.listen(cfg.managerPort, () => console.log(`Listening on port ${cfg.managerPort}`));

    const redirect_app = express();
    redirect_app.get('*', (req, res) => {
        res.send(`<html><head><title>MOVED</title></head><body></body></html>`)
    });
    let httpServer = http.createServer(redirect_app);
    httpServer.listen(cfg.managerPortHttp, () => console.log(`Listening on port ${cfg.managerPortHttp}`));
} else {
    let server = http.createServer(app);
    server.listen(cfg.managerPortHttp, () => console.log(`Listening on port ${cfg.managerPortHttp}`));
}
