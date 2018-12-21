const express = require('express');
const cfg = require("../network.config");
const {logger_init} = require("..//logger");
const fs = require("fs");
const https = require("https");
const {execFileSync} = require('child_process');
let privateKey = fs.readFileSync('../sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('../sslcert/server.crt', 'utf8');
logger_init("./log/captive.error.log", "./log/captive.log");

let credentials = {key: privateKey, cert: certificate};
const app = express();

function iptables_deny(networkFrom, networkTo, insert) {
    execFileSync(cfg.network.iptables, [insert ? "-I" : "-A", "FORWARD", "-s", networkFrom, "-d", networkTo, "-j", "DROP"])
}
function iptables_port_allow_generic(networkFrom, port, protocol, insert) {
    execFileSync(cfg.network.iptables, [insert ? "-I" : "-A", "FORWARD", "-s", networkFrom, "--dport", port, "-p", protocol, "-j", "ACCEPT"])
}
function iptables_port_allow(networkFrom, networkTo, port, protocol, insert) {
    execFileSync(cfg.network.iptables, [insert ? "-I" : "-A", "FORWARD", "-s", networkFrom, "-d", networkTo, "--dport", port, "-p", protocol, "-j", "ACCEPT"])
}
function iptables_port_deny(networkFrom, networkTo, port, protocol, insert, local) {
    execFileSync(cfg.network.iptables, [insert ? "-I" : "-A", local ? "INPUT" : "FORWARD", "-s", networkFrom, "-d", networkTo, "--dport", port, "-p", protocol, "-j", "DROP"])
}
function iptables_allow_timeout(host, networkTo, timeout, insert) {
    let curDate = new Date();
    let startt = `${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`;
    curDate.setMinutes(curDate.getMinutes() + timeout);
    let endt = `${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`;

    execFileSync(cfg.network.iptables, [insert ? "-I" : "-A", "FORWARD", "-s", host, "-d", networkTo, "-m", "time", "--timestart", startt, "--timestop", endt, "-j", "ACCEPT"])
}
function iptables_allow(host, networkTo, insert) {
    execFileSync(cfg.network.iptables, [insert ? "-I" : "-A", "FORWARD", "-s", host, "-d", networkTo, "-j", "ACCEPT"])
}
function iptables_setup_limit(packetsPerSecond, burst = 20) {
    execFileSync(cfg.network.iptables, ["--new-chain", "RATE_LIMIT"]);
    execFileSync(cfg.network.iptables, ["-A", "RATE_LIMIT", "-m", "limit", "--limit", packetsPerSecond + "/sec", "--limit-burst", burst, "-j", "ACCEPT"]);
    execFileSync(cfg.network.iptables, ["-A", "RATE_LIMIT", "-j", "DROP"]);
}
function iptables_limit_host(host, networkTo, insert) {
    execFileSync(cfg.network.iptables, [insert ? "-I" : "-A", "FORWARD", "-s", host, "-d", networkTo, "-j", "RATE_LIMIT"]);
}
function iptables_redirect_traffic(networkFrom, port, protocol, to, toPort, insert){
    execFileSync(cfg.network.iptables, ["-t", "nat", insert ? "-I" : "-A", "PREROUTING", "-s", networkFrom, "--dport", port, "-p", protocol, "-j", "DNAT", "--to-destination", to+":"+toPort])
}
function iptables_flush() {
    execFileSync(cfg.network.iptables, ["-F"])
}
function iptables_flush_nat() {
    execFileSync(cfg.network.iptables, ["-t", "nat", "-F"])
}

function init(guestNW, serverNW, opNW, internetNW, speedLimit, timeout){
    iptables_setup_limit(speedLimit);

    iptables_redirect_traffic(guestNW, 80, "tcp", cfg.serverIP, cfg.serverPortHttp);
    iptables_redirect_traffic(guestNW, 443, "tcp", cfg.serverIP, cfg.serverPort);
    iptables_deny(guestNW, internetNW);

    iptables_deny(guestNW, opNW);

    iptables_port_deny(guestNW, cfg.loginIP, cfg.serverLoginPort, "tcp");

    iptables_port_allow(guestNW, cfg.serverIP, cfg.serverPort, "tcp");
    iptables_port_allow(guestNW, cfg.serverIP, cfg.serverPortHttp, "tcp");
    iptables_port_allow(guestNW, cfg.MQTTIP, cfg.mqtt.broker.ws.port, "tcp");
    iptables_port_allow(guestNW, cfg.MQTTIP, cfg.mqtt.broker.ws.secure, "tcp");
    iptables_deny(guestNW, serverNW);

    iptables_port_allow_generic(guestNW, 53, "tcp");
    iptables_port_allow_generic(guestNW, 53, "udp");

    iptables_limit_host("0.0.0.0", internetNW, true);
    iptables_allow_timeout("0.0.0.0", internetNW, timeout, true);
}

app.post("/api/permitUser", (r, e) => {

});

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(cfg.serverLoginPort, cfg.loginBind, () => console.log(`Listening on port ${cfg.serverLoginPort}`));