const mysql = require('mysql');
const cfg = require('./network.config');

let connection = undefined;

function connect(host, user, password, db) {
    connection = mysql.createConnection({
        host: host,
        user: user,
        password: password,
        database: db
    });

    connection.connect();

}

function secure(str){
    return str.replaceAll("'", "").replaceAll("`", "").replaceAll('"', "").replaceAll("--", "")
}

function getConnection() {
    if (!connection)
        connect(cfg.mysql.host, cfg.mysql.user, cfg.mysql.password, cfg.mysql.database);

    return connection;
}

module.exports.getConnection = getConnection;
module.exports.secure = secure;