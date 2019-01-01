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
        if (data.modified)
            data.modified.forEach(e => {
                e.eur = e.costo.split(".")[0];
                e.cents = e.costo.split(".")[1];
                getConnection().query(`INSERT INTO magazzino(id, descrizione, info, giacenza, prezzoEur, prezzoCents, gruppo, details) VALUES (${secure(e.id)}, ${secure(e.desc)}, ${secure(e.info)}, ${secure(e.giacenza)}, ${secure(e.eur)}, ${secure(e.cents)}, 1, 1) ON DUPLICATE KEY UPDATE id=${e.id}, descrizione="${e.desc}", info="${e.info}", giacenza=${e.giacenza}, prezzoEur=${e.eur}, prezzoCents=${e.cents}, gruppo=1, details=1`);
            });
    }, ["MAGAZZINO"]);
}
