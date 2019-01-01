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
        getConnection().query(`SELECT magazzino.descrizione as descrizione, magazzino.info as info, magazzino.giacenza as giacenza, magazzino.prezzoEur as eur, magazzino.prezzoCents as cents, gruppi_cucina.nome as gnome, gruppi_cucina.bg as gbg, details.json as json FROM magazzino, gruppi_cucina, details WHERE magazzino.gruppo = gruppi_cucina.id AND magazzino.details = details.id ORDER BY giacenza ASC`, (e, r, f) => {
            if (r && !e) {
                let map = new Map();
                r.forEach(e => {
                    let json = '{"display": false}';
                    try {
                        json = JSON.parse(e.json)
                    } catch (e) {
                    }

                    let obj = {
                        desc: e.descrizione,
                        info: e.info,
                        giacenza: e.giacenza,
                        costo: (e.eur + (e.cents / 100)),
                        details: json,
                        gnome: e.gnome
                    };
                    if (!map.has(e.descrizione)) map.set(e.descrizione, obj);
                    else map.get(e.descrizione).elements.push(obj)
                });
                let obj = {};
                map.forEach((v, k) => {
                    obj[k] = v
                });
                res.send({state: true, list: obj});
                return;
            }
            console.log(e);
            res.send({state: false})
        })
    }, ["MAGAZZINO"])
}
