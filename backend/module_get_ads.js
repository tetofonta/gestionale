const {onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");

module.exports.callback = (req, res) => {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, \`desc\`, rank, image_src FROM ads;`, (e, r, f) => {
            if(!r || e){
                res.send({state: false, err: e});
                return;
            }
            res.send({state: true, ret: r})
        })
    }, ["AMMINISTRAZIONE"])
};