
const OP = "client";
const GUEST = "guest";

module.exports.callback = function (proxy) {
    proxy.send({express: true, kind: proxy.getNW() ? OP : GUEST});
};