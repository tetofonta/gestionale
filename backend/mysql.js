const mysql = require('mysql');
const Connection = require('mysql/lib/Connection');
const cfg = require('./network.config');

let connection = undefined;
let avgQueryTime = [];

String.prototype.replaceAll = function (search, replacement) {
    const target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

let mysqlremote = false;
if (process.argv[2] && process.argv[2] === "-remote") {
    mysqlremote = true;
    console.log("using remote connection");
}

function connect(host, user, password, db) {
    connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: db,
        multipleStatements: true
    });

    connection.query = function (sql, cb) {
        let start = Date.now();
        Connection.prototype.query.call(this, sql, [], function (e, r, f) {
            if (avgQueryTime.length > cfg.mysql.queryTimeHistory) avgQueryTime.splice(0, 1);
            let time = Date.now() - start;
            avgQueryTime.push(time);
            if (cb) cb(e, r, f, time)
        });
    };
}

function secure(str) {
    if(!connection){
        console.error("Trying to escape without getting a connection");
    }
    return connection.escape(str).replaceAll("'", "")
}

function getConnection() {
    if (!connection)
        connect(mysqlremote ? cfg.mysql.host : "localhost", cfg.mysql.user, cfg.mysql.password, cfg.mysql.database);

    return connection;
}

module.exports.getConnection = getConnection;
module.exports.secure = secure;
module.exports.avgQTime = () => avgQueryTime;