module.exports.callback = function (res) {
    res.send({ip: (res.req.headers['x-forwarded-for'] || res.req.connection.remoteAddress || res.req.socket.remoteAddress || res.req.connection.socket.remoteAddress).split(",")[0]});
};