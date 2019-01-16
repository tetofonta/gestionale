
module.exports.callback = function (proxy) {
    proxy.getConnection().query(`SELECT magazzino.id as id, magazzino.descrizione as descrizione, magazzino.info as info, magazzino.giacenza > 10 as disponibile, magazzino.prezzoEur as eur, magazzino.prezzoCents as cents, gruppi_cucina.nome as gnome, gruppi_cucina.bg as gbg, details.json as json FROM magazzino, gruppi_cucina, details WHERE magazzino.gruppo = gruppi_cucina.id AND magazzino.details = details.id`, (e, r, f) => {
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
            proxy.send({state: true, list: obj});
            return;
        }
        console.log(e);
        proxy.send({state: false})
    })
}
