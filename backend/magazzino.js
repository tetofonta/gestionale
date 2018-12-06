const {getConnection} = require("./mysql");
const {onUserAuthenticated} = require("./auth");

/**
 * Ritorna la lista dei piatti disponibili
 * @param req express request obj
 * @param res express response obj
 * @requires POST/GET
 * @return JSON, {state: bool} in caso di errore, {state: bool, list: {<CATEGORIA>: {bg: String, elements: [{desc: String, info: String, dispon: bool, eur: Number, cents: Number, details: {display: bool, title: String, dialog: {select: [vals...], choose: [vals...]}}]}, <...>:{...}}}
 */
function get_product_list(req, res) {
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
                    details: json,
                    cat: e.gnome
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

function get_products(req, res) {
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
}

function get_gruppi_cucina(req, res) {
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
    });
}

function get_popups(req, res) {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, json FROM details WHERE 1 ORDER BY id ASC`, (e, r, f) => {
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
    });
}

function add_meals(req, res) {
    onUserAuthenticated(req, res, (data) => {
        if (data.modified)
            data.modified.forEach(e => {
                e.eur = e.costo.split(".")[0];
                e.cents = e.costo.split(".")[1];
                getConnection().query(`INSERT INTO magazzino(id, descrizione, info, giacenza, prezzoEur, prezzoCents, gruppo, details) VALUES (${e.id}, ${e.desc}, ${e.info}, ${e.giacenza}, ${e.eur}, ${e.cents}, 1, 1) ON DUPLICATE KEY UPDATE id=${e.id}, descrizione="${e.desc}", info="${e.info}", giacenza=${e.giacenza}, prezzoEur=${e.eur}, prezzoCents=${e.cents}, gruppo=1, details=1`);
            });
    });
}

module.exports.get_products_list = get_product_list;
module.exports.get_gruppi_cucina = get_gruppi_cucina;
module.exports.get_popups = get_popups;
module.exports.get_products = get_products;
module.exports.add_meals = add_meals;

