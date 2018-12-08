module.exports.makeGET = (network, callback, onDataRecv, heads={}) => {
    let req = {connection: {}, headers: heads, method: "GET"}, res = {data: []};
    req.connection.remoteAddress = "::ffff:" + network;
    res.send = function(obj){onDataRecv(obj)};
    callback(req, res);
};

module.exports.makePOST = (network, postData, callback, onDataRecv, heads={}) => {
    let req = {connection: {}, body: postData, headers: heads, method: "POST"}, res = {data: []};
    req.connection.remoteAddress = "::ffff:" + network;
    res.send = function(obj){onDataRecv(obj)};
    callback(req, res);
};