const {getNW} = require("./network");

const OP = "client";
const GUEST = "guest";

module.exports.callback = function(req, res){
    res.send({ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0]});
};