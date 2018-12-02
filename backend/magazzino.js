const {getConnection} = require("./mysql");

/**
 * Ritorna la lista dei piatti disponibili
 * @param req express request obj
 * @param res express response obj
 * @requires POST/GET
 * @return JSON, {state: bool} in caso di errore, {state: bool, list: {<CATEGORIA>: {bg: String, elements: [{desc: String, info: String, dispon: bool, eur: Number, cents: Number, details: {display: bool, title: String, dialog: {select: [vals...], choose: [vals...]}}]}, <...>:{...}}}
 */
function get_product_list(req, res){
    getConnection().query(`SELECT magazzino.id as id, magazzino.descrizione as descrizione, magazzino.info as info, magazzino.giacenza > 10 as disponibile, magazzino.prezzoEur as eur, magazzino.prezzoCents as cents, gruppi_cucina.nome as gnome, gruppi_cucina.bg as gbg, details.json as json FROM magazzino, gruppi_cucina, details WHERE magazzino.gruppo = gruppi_cucina.id AND magazzino.details = details.id`, (e, r, f) => {
        if (r && !e) {
            let map = new Map();
            r.forEach(e => {
                let json = '{"display": false}';
                try {
                    json = JSON.parse(e.json)
                } catch (e) {
                }
                let obj = {
                    id: e.id,
                    desc: e.descrizione,
                    info: e.info,
                    dispon: e.disponibile,
                    eur: e.eur,
                    cents: e.cents,
                    details: json
                };
                if (!map.has(e.gnome)) map.set(e.gnome, {bg: e.gbg, elements: [obj]});
                else map.get(e.gnome).elements.push(obj)
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
}

module.exports.get_products_list = get_product_list;

