const {getConnection} = require("./mysql");
const {onUserAuthenticated} = require("./auth");

/**
 * Ritorna la lista dei piatti disponibili
 * @param req express request obj
 * @param res express response obj
 * @requires POST/GET
 * @return JSON, {state: bool} in caso di errore, {state: bool, list: {<CATEGORIA>: {bg: String, elements: [{desc: String, info: String, dispon: bool, eur: Number, cents: Number, details: {display: bool, title: String, dialog: {select: [vals...], choose: [vals...]}}]}, <...>:{...}}}
 */
module.exports.callback = function (req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, nome FROM gruppi_cucina WHERE 1 ORDER BY id ASC`, (e, r, f) => {
            if (r.length < 1) {
                res.send({state: false, err: ""});
                return;
            }
            if (r && !e) {
                res.send({state: true, list: r});
                return;
            }
            res.send({state: false, err: ""})
        });
    }, ["MAGAZZINO"]);
}
