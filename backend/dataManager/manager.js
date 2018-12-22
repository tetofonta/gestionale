const {getConnection, secure} = require("../mysql");
const express = require('express');
const http = require('http');
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

let server = http.createServer(app);
server.listen(cfg.managerPort, () => console.log(`Listening on port ${cfg.managerPort}`));