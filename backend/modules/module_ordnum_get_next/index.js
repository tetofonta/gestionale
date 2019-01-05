const request = require("request");

module.exports.auth_required = true;
module.exports.privs = ["CASSA"];

module.exports.format = [];


module.exports.callback = function (res) {
    request(`${res.cfg.network.manager_use_ssl ? "https://" : "http://" }${res.cfg.managerIP}:${res.cfg.managerPort}/api/getNext`, res.recv, (err, resp, body) => {
        res.send(body)
    })
}