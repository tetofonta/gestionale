const {getNW} = require("./network");
const {getUsers, onUserAuthenticated} = require("./auth");
const {getConnection, secure} = require("./mysql");
const crypto = require('crypto');

module.exports.callback = function(req, res) {
    let data = req.body;
    if(!data.answers || !Array.isArray(data.answers)) res.send({state: false});
    data.answers.forEach(e => {
        getConnection().query(`insert into answers(answer, details, question) values ('${secure(e.answer)}', '${secure(e.details)}', ${secure(e.id)})`, (e) => {
            if(e) console.error(e)
        });
    });
    res.send({state: true});
};
