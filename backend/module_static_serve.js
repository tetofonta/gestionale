const path = require('path');
const cfg = require("./network.config")

module.exports.callback = function(req, res){
    res.sendFile(path.join('/static/index.html', { root: cfg.static_root }));
};