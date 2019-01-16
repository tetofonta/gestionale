const request = require("request");

module.exports.format = [
    {
        field: "user",
        type: "string",
        required: true
    },
    {
        field: "token",
        type: "string",
        required: true
    }
];

module.exports.callback = function (proxy) {
    request.post({
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: `${proxy.cfg.network.manager_use_ssl ? "https://" : "http://" }${proxy.cfg.managerIP}:${proxy.cfg.managerPort}/api/refresh`,
        body: JSON.stringify(proxy.recv)
    }, (err, resp, body) => {
        proxy.send(body)
    })
};
