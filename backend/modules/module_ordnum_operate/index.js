const request = require("request");

module.exports.auth_required = true;
module.exports.privs = ["AMMINISTRAZIONE"];

module.exports.format = [
    {
        field: "set",
        required: false,
        type: "number",
        strict: false
    },
    {
        field: "value",
        required: false,
        type: "number",
        strict: false
    }
];


module.exports.callback = function (proxy) {
    request.post({
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: `${proxy.cfg.network.manager_use_ssl ? "https://" : "http://" }${proxy.cfg.managerIP}:${proxy.cfg.managerPort}/api/operate`,
        body: JSON.stringify(proxy.recv)
    }, (err, resp, body) => {
        proxy.send(body)
    })
};