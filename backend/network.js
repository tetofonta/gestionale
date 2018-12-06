const cfg = require('./network.config')

const opNetwork = {ip: cfg.network.opNetwork.ip, sub: cfg.network.opNetwork.subnet};

let hwip = undefined; //DO NOT EDIT

function createIP(confs) {
    let hwip = {ip: 0, sub:0};
    confs.ip.forEach((e, i) => hwip.ip |= ((e & 0xFF) << (3 - i)*8));
    for(let i = 0; i<confs.sub; i++) hwip.sub |= 1 << (31-i);
    return hwip;
}

function isInNetwork(hwip, netw) {
    let real = netw.ip & hwip.sub;
    return hwip.ip === real;
}

function getNW(req) {
    if(!hwip)
        hwip = createIP(opNetwork);

    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    ip = ip.replace("::ffff:", "");
    ip = ip.split(".");
    ip.forEach((e, i, a) => a[i] = parseInt(e));

    return isInNetwork(hwip, createIP({ip: ip, sub: opNetwork.sub}));
}

function getNW_st(ip) {
    let allowed_ip = createIP(opNetwork);
    ip = ip.split(".");
    ip.map(e => parseInt(e));

    return isInNetwork(allowed_ip, createIP({ip: ip, sub: opNetwork.sub}));
}

module.exports.getNW = getNW;
module.exports.getNW_st = getNW_st;