const request = require("request");

module.exports.callback = function (proxy) {
    let ip = (proxy.req.headers['x-forwarded-for'] || proxy.req.connection.remoteAddress || proxy.req.socket.remoteAddress || proxy.req.connection.socket.remoteAddress).split(",")[0];
    ip = ip.replace("::ffff:", "");
    let r = {
        client: ip,
        usr: proxy.recv.usr,
        psw: proxy.recv.psw
    };

    request.post({
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: `${proxy.cfg.network.captive_login_use_ssl ? "https://" : "http://"}${proxy.cfg.loginIP}:${proxy.cfg.serverLoginPort}/api/login`,
        body: JSON.stringify(r)
    }, (err, resp, body) => {
        proxy.send(body)
    })
};