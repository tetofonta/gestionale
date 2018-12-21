const {getConnection} = require("../mysql");
const express = require('express');
const http = require('http');
const cfg = require("../network.config");
const {getNW} = require('../network');
const bodyParser = require('body-parser');
const {logger_init} = require("./logger");
logger_init("./log/counter.error.log", "./log/counter.log");

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

let currentno = 0;
let accessing = false;

getConnection().query(`SELECT ordnum FROM ordini_dettagli WHERE \`timestamp\` = (SELECT MAX(\`timestamp\`) FROM ordini_dettagli) LIMIT 1`, (e, r) => {
    if (!r || e) return;
    currentno = r[0].ordnum;
});

function operateNo(req, res) {
    if (getNW(req)) {
        let data = req.body;
        if (data.set)
            if (!isNaN(parseInt(data.value))) {
                currentno = parseInt(data.value);
                res.send({state: true, err: "ok"});
            }
            else res.send({state: false, err: "Il valore non é un numero."});
        else res.send({state: true, num: currentno});
    } else {
        res.send({state: false, err: "forbidden"});
    }
}

function increment(req, res) {
    if (getNW(req)) {
        while (accessing) ;
        accessing = true;
        let no = currentno++;
        accessing = false;

        res.send({state: true, ordnum: no});
    } else {
        res.send({state: false, err: "forbidden"});
    }
}

app.post("/api/operate", operateNo);
app.get("/api/getNext", increment);
app.get("/", (req, res) => {res.send("ALIVE")});

let server = http.createServer(app);
server.listen(cfg.counterPort, () => console.log(`Listening on port ${cfg.counterPort}`));