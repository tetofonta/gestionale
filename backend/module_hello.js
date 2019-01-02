const {getNW} = require("./network");

const OP = "client";
const GUEST = "guest";

module.exports.callback = function (req, res) {
    res.send({express: true, kind: getNW(req) ? OP : GUEST});
};