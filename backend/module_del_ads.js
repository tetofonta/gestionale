const {getConnection, secure} = require("./mysql");
const {onUserAuthenticated} = require("./auth");

module.exports.callback = (req, res) => {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`DELETE FROM ads WHERE id = ${secure(data.id)}`)
    }, ["AMMINISTRAZIONE"])
};