module.exports.auth_required = true;
module.exports.privs = ["MAGAZZINO"];

module.exports.format = [];

module.exports.callback = function (proxy) {
    proxy.getConnection().query(`SELECT magazzino.descrizione as descrizione, magazzino.info as info, magazzino.giacenza as giacenza, magazzino.prezzoEur as eur, magazzino.prezzoCents as cents, gruppi_cucina.nome as gnome, gruppi_cucina.bg as gbg, details.json as json FROM magazzino, gruppi_cucina, details WHERE magazzino.gruppo = gruppi_cucina.id AND magazzino.details = details.id ORDER BY giacenza ASC`, (e, r, f) => {
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
            proxy.send({state: true, list: obj});
            return;
        }
        console.log(e);
        proxy.send({state: false})
    })
}
