const {exec, chain, FORWARD, ipt_default, ipt_flush, PREROUTING, source_network, timed, to_protocol_port, Rule} = require("./Rule");
const express = require('express');
const cfg = require("../network.config");
const {logger_init} = require("..//logger");
const fs = require("fs");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const bodyParser = require("body-parser");
const {getConnection, secure} = require("../mysql");
let privateKey = fs.readFileSync('../sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('../sslcert/server.crt', 'utf8');
logger_init("./log/captive.error.log", "./log/captive.log");

let credentials = {key: privateKey, cert: certificate};
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

const RATELIMIT = chain("RATELIMIT")();
const HOSTFW = chain("HOSTFW")();

function ping(ip, iface, cb) {
    let out = exec("arping", ["-c", "1", "-I", iface, ip]);
    let err = !out;
    out = out.split("\n")[1].split(" ");
    let info = {};
    info.ip = out[3];
    info.tha = out[4].substr(1, out[4].length - 2);
    info.time = out[6];
    cb(err, info);
}

let map = {};

function validateConnection(interval, rules, ip) {
    ping(ip, cfg.network.guest_interface, (err, info) => {
        if (err && !map[ip]) {
            clearInterval(interval);
            return;
        }
        if (err && map[ip]) {
            console.log(`client ${info.tip} disconnected. deleting...`);
            rules.forEach(e => e.deleteRule());
            delete map[ip];
            clearInterval(interval);
            return;
        }
        if (!map[ip]) {
            console.log(`new host joined ${info.tip} as ${info.tha}`);
            map[ip] = info.tha;
            return;
        }
        if (map[ip] === info.tha) return;
        console.log(`client changed at ${info.tip} (${map[ip]} => ${info.tha}), deleting...`);
        rules.forEach(e => e.deleteRule());
        clearInterval(interval);
        delete map[ip];
    })
}

function permitUser(ip, internet, guest) {

    let now = new Date();
    let start = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    now.setMinutes(now.getMinutes() + cfg.network.host_internet_minutes);
    let end = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    let rules = [
        new Rule().insert(FORWARD).filter(source_network(ip, 32)).filter(to_protocol_port("tcp", 80)).filter(internet.dest).filter(timed(start, end)).jump(RATELIMIT),
        new Rule().insert(FORWARD).filter(source_network(ip, 32)).filter(to_protocol_port("tcp", 443)).filter(internet.dest).filter(timed(start, end)).jump(RATELIMIT),
        new Rule("nat").insert(PREROUTING).filter(source_network(ip, 32)).filter(timed(start, end)).jump(HOSTFW)
    ];

    rules.forEach(e => e.execute());
    let object = setInterval(() => validateConnection(object, rules, ip, guest), cfg.network.renew_interval * 1000)
}

app.post("/api/login", (req, res) => {

    let data = req.body;
    if (!data.usr || !data.psw) {
        res.send({state: false, err: "Insufficent data"});
        return;
    }
    data.usr = secure(data.usr);
    let shasum = crypto.createHash('sha1');
    shasum.update(data.psw);
    let hpsw = shasum.digest('hex');

    getConnection().query(`SELECT id FROM credentials WHERE \`user\` = '${data.usr}' AND passw_hash = '${hpsw}' AND used = 0 AND initiate >= ${Math.floor(Date.now() / 1000) - cfg.network.registration_timeout}`, (e, r) => {
        if (!r || e) {
            res.send({state: false, err: e});
            return;
        }
        if (r.length !== 1) {
            res.send({state: false, err: "INVALID CREDS"});
            return;
        }
        getConnection().query(`UPDATE credentials SET used = 1, client='${secure(req.body.client)}' WHERE \`user\` = '${data.usr}'`, (e, r) => {
            if (e) {
                console.error(e);
                res.send({state: false, err: 500});
                return;
            }
            permitUser(req.body.client, iface(cfg.network.internet_iface));
            res.send({state: true})

        });
    })
});

ipt_default();
ipt_flush();
getConnection().query("SELECT 1");

if (cfg.network.lb_use_ssl) {
    let privateKey = fs.readFileSync('sslcert/server.key', 'utf8');
    let certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    let credentials = {key: privateKey, cert: certificate};
    let httpsServer = https.createServer(credentials, app);
    httpsServer.listen(cfg.serverLoginPort, () => console.log(`Listening on port ${cfg.serverLoginPort}`));

    const redirect_app = express();
    redirect_app.get('*', (req, res) => {
        res.send(`<html><head><title>MOVED</title></head><body></body></html>`)
    });
    let httpServer = http.createServer(redirect_app);
    httpServer.listen(cfg.serverLoginPortHttp, () => console.log(`Listening on port ${cfg.serverLoginPortHttp}`));
} else {
    let server = http.createServer(app);
    server.listen(cfg.serverLoginPort, () => console.log(`Listening on port ${cfg.serverLoginPort}`));
}


