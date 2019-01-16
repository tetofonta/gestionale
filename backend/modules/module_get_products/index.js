module.exports.auth_required = true;
module.exports.privs = ["MAGAZZINO"];

module.exports.format = [];

module.exports.callback = function (proxy) {
    proxy.getConnection().query(`SELECT id, descrizione, info, giacenza, prezzoEur, prezzoCents, gruppo, details FROM magazzino ORDER BY giacenza ASC`, (e, r, f) => {
            if (r && !e) {
            let map = new Map();
            r.forEach(e => {
                let obj = {
                    id: e.id,
                    desc: e.descrizione,
                    info: e.info,
                    giacenza: e.giacenza,
                    costo: (e.prezzoEur + (e.prezzoCents / 100)),
                    details: e.details,
                    gruppo: e.gruppo
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
