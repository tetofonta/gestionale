const {execFileSync} = require('child_process');
const cfg = require("../network.config");

function exec(command, args) {
    console.log(command + " " + args.join(" "));
    let out;
    try {
        out = (execFileSync(command, args)).toString();
        console.log("EXECUTED")
    } catch (e) {
        console.error("Error in `" + command + " " + args.join(" ") + "`: " + e);
        console.log("ERRORED. See *.error.log for details");
        return undefined
    }
    return out;
}

module.exports.exec = exec;

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

module.exports.chain = chain;
module.exports.filter = filter;

module.exports.INPUT = chain("INPUT")();
module.exports.FORWARD = chain("FORWARD")();
module.exports.OUTPUT = chain("OUTPUT")();
module.exports.PREROUTING = chain("PREROUTING")();
module.exports.POSTROUTING = chain("POSTROUTING")();
module.exports.ACCEPT = chain("ACCEPT")();
module.exports.DROP = chain("DROP")();
module.exports.REDIRECT = (port) => chain("REDIRECT", ["--to-ports"])([port]);
module.exports.DNAT = (to) => chain("DNAT", ["--to-destination"])([to]);
module.exports.SNAT = (as) => chain("INPUT", ["--to-source"])([as]);
module.exports.MARK = (mark) => chain("MARK", ["--set-mark"])([mark]);


module.exports.source_network = (nw, nm) => filter("-s")(nw + "/" + nm);
module.exports.destination_network = (nw, nm) => filter("-d")(nw + "/" + nm);
module.exports.to_protocol_port = (protocol, port) => filter("-p", ["--dport"])(protocol, [port]);
module.exports.from_protocol_port = (protocol, port) => filter("-p", ["--sport"])(protocol, [port]);
module.exports.source_interface = (ifaceName) => filter("-i")(ifaceName);
module.exports.destination_interface = (ifaceName) => filter("-o")(ifaceName);
module.exports.marked = (mark) => filter("-m", ["--mark"])("mark", [mark]);
module.exports.timed = (timestart, timestop) => filter("-m", ["--timestart", "--timestop"])("time", [timestart, timestop]);
module.exports.limit = (perSec, burst) => filter("-m", ["--limit", "--limit-burst"])("limit", [perSec + "/sec", burst]);
module.exports.state = (states) => filter("-m", ["--state"])("state", [states]);
module.exports.protocol = (proto) => filter("-p")(proto);

module.exports.iface = (name) => {
    return {
        source: source_interface(name),
        dest: destination_interface(name),
        sourceF: source_interface,
        destF: destination_interface,
        prams: name
    }
};
module.exports.network = (ip, nm) => {
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
        this.deleting = "";
        this.jumping = "";
        this.filters = [];
    }

    _setDestination(chain, key, index) {
        if (this.appending !== "") {
            console.error("Append/insert already defined");
            return this;
        }
        if (!(chain.type && chain.type === "chain" && chain.name)) throw Error("Tryng to append/insert to non chain element");
        this.appending = key + " " + chain.name + index ? " " + index : "";
        this.deleting = "-D " + chain.name;
        return this;
    }

    append(chain) {
        return this._setDestination(chain, "-A");
    }

    insert(chain, index) {
        return this._setDestination(chain, "-I", index);
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

    deleteRule() {
        exec(cfg.network.iptables, `${this.table ? "-t " + this.table : ""} ${this.deleting} ${this.filters.join(" ")} ${this.jumping}`.split(" "));
    }
}

module.exports.Rule = Rule;

module.exports.ipt_flush = function () {
    exec(cfg.network.iptables, ["-F"]);
    exec(cfg.network.iptables, ["-t", "nat", "-F"]);
    exec(cfg.network.iptables, ["-t", "mangle", "-F"]);
}

module.exports.ipt_default = function () {
    exec(cfg.network.iptables, ["-P", "INPUT", "DROP"]);
    exec(cfg.network.iptables, ["-P", "FORWARD", "DROP"]);
    exec(cfg.network.iptables, ["-P", "OUTPUT", "ACCEPT"]);
}

module.exports.ipt_do_on_filters = function (table, fixedFilters, filter, insert, appendChain, jumpChain, values) {
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