const path = require('path');

module.exports.callback = function (proxy) {
    proxy.res.sendFile(path.join('/static/index.html', {root: proxy.cfg.static_root}));
};