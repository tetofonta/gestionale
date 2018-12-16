const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
const cfg = require('./network.config');

let connection = undefined;
let avgQueryTime = [];

String.prototype.replaceAll = function (search, replacement) {
    const target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function connect(host, user, password, db) {
    connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: db,
        multipleStatements: true
    });

    connection.query = function(sql, cb){
        let start = Date.now();
        Connection.prototype.query.call(this, sql, [], function(e, r, f){
            if(avgQueryTime.length > cfg.mysql.queryTimeHistory) avgQueryTime.splice(0, 1);
            let time = Date.now() - start;
            avgQueryTime.push(time);
            cb(e, r, f, time)
        });
    };
}

function secure(str) {
    return str.replaceAll("'", "").replaceAll("`", "").replaceAll("--", "")
}

function getConnection() {
    if (!connection)
        connect(cfg.mysql.host, cfg.mysql.user, cfg.mysql.password, cfg.mysql.database);

    return connection;
}

module.exports.getConnection = getConnection;
module.exports.secure = secure;
module.exports.avgQTime = () => avgQueryTime;