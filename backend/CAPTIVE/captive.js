const express = require('express');
const cfg = require("../network.config");
const {logger_init} = require("..//logger");
const fs = require("fs");
const crypto = require("crypto");
const https = require("https");
const {execFileSync} = require('child_process');
const bodyParser = require("body-parser")
const {getConnection, secure} = require("../mysql");
let privateKey = fs.readFileSync('../sslcert/server.key', 'utf8');
let certificate = fs.readFileSync('../sslcert/server.crt', 'utf8');
logger_init("./log/captive.error.log", "./log/captive.log");

let credentials = {key: privateKey, cert: certificate};
const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies

function exec(command, args) {
    console.log(command + " " + args.join(" "));
    try {
        execFileSync(command, args);
        console.log("EXECUTED")
    } catch (e) {
        console.error("Error in `" + command + " " + args.join(" ") + "`: " + e);
        console.log("ERRORED. See *.error.log for details");
    }

}

const standardChains = ["INPUT", "FORWARD", "OUTPUT", "PREROUTING", "POSTROUTING", "ACCEPT", "DROP", "REDIRECT", "DNAT", "SNAT", "MARK"];
const chain = (name, wanted) => {
    if (!wanted) wanted = [];
    // if(!standardChains.includes(name.toUpperCase()))
    //   execFileSync(cfg.network.iptables, ["-N", name]);
    return (prams) => {
        if (!prams) prams = [];
        if (prams.length < wanted.length) throw Error("NOT ENOUGH PARAMETERS");
        return {
            type: "chain",
            name: name,
            jumpName: name + " " + wanted.map((e, i) => e + " " + prams[i])
        }
    }
};
const filter = (key, wanted) => {
    if (!wanted) wanted = [];
    return (value, prms) => {
        if (!prms) prms = [];
        if (prms.length < wanted.length) throw Error("NOT ENOUGH PARAMETERS");
        return {
            type: "filter",
            value: key + " " + value + " " + wanted.map((e, i) => e + " " + prms[i])
        }
    }
};

const INPUT = chain("INPUT")();
const FORWARD = chain("FORWARD")();
const OUTPUT = chain("OUTPUT")();
const PREROUTING = chain("PREROUTING")();
const POSTROUTING = chain("POSTROUTING")();
const ACCEPT = chain("ACCEPT")();
const DROP = chain("DROP")();
const REDIRECT = (port) => chain("REDIRECT", ["--to-ports"])([port]);
const DNAT = (to) => chain("DNAT", ["--to-destination"])([to]);
const SNAT = (as) => chain("INPUT", ["--to-source"])([as]);
const MARK = (mark) => chain("MARK", ["--set-mark"])([mark]);
const RATELIMIT = chain("RATELIMIT")();
const HOSTFW = chain("HOSTFW")();

const source_network = (nw, nm) => filter("-s")(nw + "/" + nm);
const destination_network = (nw, nm) => filter("-d")(nw + "/" + nm);
const to_protocol_port = (protocol, port) => filter("-p", ["--dport"])(protocol, [port]);
const from_protocol_port = (protocol, port) => filter("-p", ["--sport"])(protocol, [port]);
const source_interface = (ifaceName) => filter("-i")(ifaceName);
const destination_interface = (ifaceName) => filter("-o")(ifaceName);
const marked = (mark) => filter("-m", ["--mark"])("mark", [mark]);
const timed = (timestart, timestop) => filter("-m", ["--timestart", "--timestop"])("time", [timestart, timestop]);
const limit = (perSec, burst) => filter("-m", ["--limit", "--limit-burst"])("limit", [perSec + "/sec", burst]);
const state = (states) => filter("-m", ["--state"])("state", [states]);
const protocol = (proto) => filter("-p")(proto);

const iface = (name) => {
    return {
        source: source_interface(name),
        dest: destination_interface(name),
        sourceF: source_interface,
        destF: destination_interface,
        prams: name
    }
};
const network = (ip, nm) => {
    return {
        source: source_network(ip, nm),
        dest: destination_network(ip, nm),
        sourceF: source_network(ip, nm),
        destF: destination_network(ip, nm),
        prams: [ip, nm]
    }
};

class Rule {
    constructor(table) {
        this.table = table;
        this.appending = "";
        this.jumping = "";
        this.filters = [];
    }

    _setDestination(chain, key) {
        if (this.appending !== "") {
            console.error("Append/insert already defined");
            return this;
        }
        if (!(chain.type && chain.type === "chain" && chain.name)) throw Error("Tryng to append/insert to non chain element");
        this.appending = key + " " + chain.name;
        return this;
    }

    append(chain) {
        return this._setDestination(chain, "-A");
    }

    insert(chain) {
        return this._setDestination(chain, "-I");
    }

    jump(chain) {
        if (this.jumping !== "") {
            console.error("jumping already already defined");
            return this;
        }
        if (!(chain.type && chain.type === "chain" && chain.jumpName)) throw Error("Tryng to jump to non chain element");
        this.jumping = "-j " + chain.jumpName;
        return this;
    }

    filter(filter, not) {
        if (Array.isArray(filter)) {
            filter.forEach(e => this.filter(e));
            return this;
        }
        if (!(filter.type && filter.type === "filter" && filter.value)) throw Error("Tryng to jump to non chain element");
        this.filters.push((not ? "!" : "") + filter.value);
        return this;
    }

    getCommandAsString() {
        return `${cfg.network.iptables} ${this.table ? "-t " + this.table : ""} ${this.appending} ${this.filters.join(" ")} ${this.jumping}`;
    }

    getArgsArray() {
        return `${this.table ? "-t " + this.table : ""} ${this.appending} ${this.filters.join(" ")} ${this.jumping}`.split(" ");
    }

    execute() {
        exec(cfg.network.iptables, this.getArgsArray());
    }
}

function ipt_flush() {
    exec(cfg.network.iptables, ["-F"]);
    exec(cfg.network.iptables, ["-t", "nat", "-F"]);
    exec(cfg.network.iptables, ["-t", "mangle", "-F"]);
}

function ipt_default() {
    exec(cfg.network.iptables, ["-P", "INPUT", "DROP"]);
    exec(cfg.network.iptables, ["-P", "FORWARD", "DROP"]);
    exec(cfg.network.iptables, ["-P", "OUTPUT", "ACCEPT"]);
}

function ipt_do_on_filters(table, fixedFilters, filter, insert, appendChain, jumpChain, values) {
    values.forEach(e => {
        let rule = new Rule(table);
        if (insert) rule.insert(appendChain);
        else rule.append(appendChain);

        if (Array.isArray(fixedFilters))
            fixedFilters.forEach((f, i) => rule.filter(f));
        else if (fixedFilters)
            rule.filter(fixedFilters);

        if (filter) {
            if (Array.isArray(filter))
                filter.forEach((f, i) => rule.filter(f.apply(this, e[i])));
            else
                rule.filter(filter.apply(this, e));
        }

        rule.jump(jumpChain).execute();
    })
}

function permitUser(ip, internet) {

    let now = new Date();
    let start = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    now.setMinutes(now.getMinutes() + cfg.network.host_internet_minutes);
    let end = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    new Rule().insert(FORWARD).filter(source_network(ip, 32)).filter(to_protocol_port("tcp", 80)).filter(internet.dest).filter(timed(start, end)).jump(RATELIMIT).execute();
    new Rule().insert(FORWARD).filter(source_network(ip, 32)).filter(to_protocol_port("tcp", 443)).filter(internet.dest).filter(timed(start, end)).jump(RATELIMIT).execute();
    new Rule("nat").insert(PREROUTING).filter(source_network(ip, 32)).filter(timed(start, end)).jump(HOSTFW).execute();
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
            if(e){
                console.error(e);
                res.send({state: false, err: 500})
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

let httpsServer = https.createServer(credentials, app);
httpsServer.listen(cfg.serverLoginPort, () => console.log(`Listening on port ${cfg.serverLoginPort}`));