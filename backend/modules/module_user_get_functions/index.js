
module.exports.format = [];

module.exports.callback = function (proxy) {
    if (!(proxy.getNW() && !proxy.req.body.guest)) {
        proxy.getConnection().query(`select funzioni.modulename as modulo, funzioni.tooltip as tooltip, funzioni.to as too,titolo, descrizione, categoria.nome as catName, categoria.icona as catIcon, funzioni.icona as fncIcon from funzioni, categoria where categoria.id = funzioni.categoria AND funzioni.isPublic = 1;`, (err, resp, fields) => {
            let cats = new Map();
            if (resp && !err) {
                for (let i = 0; i < resp.length; i++) {
                    if (!cats.has(resp[i].catName)) cats.set(resp[i].catName, {icon: resp[i].catIcon, fncs: []});
                    cats.get(resp[i].catName).fncs.push({
                        name: resp[i].titolo,
                        desc: resp[i].descrizione,
                        icon: resp[i].fncIcon,
                        to: resp[i].too,
                        tooltip: resp[i].tooltip,
                        modulename: resp[i].modulo
                    })
                }
                let ret = [];

                cats.forEach((v, k) => {
                    ret.push({category: k, icon: v.icon, content: v.fncs})
                });
                proxy.send({state: true, ret: ret});
                return;
            }
            console.log(err);
            proxy.send({state: false, err: "500"});
        });
    } else
        proxy._ifAuthOk(proxy, (proxy) => {
            proxy.getConnection().query(`select funzioni.modulename as modulo, funzioni.tooltip as tooltip, funzioni.to as too,titolo, descrizione, categoria.nome as catName, categoria.icona as catIcon, funzioni.icona as fncIcon from funzioni, categoria where categoria.id = funzioni.categoria AND req_prev IN (SELECT previlegi_FOREGIN from utenti_previlegi_assoc, utenti where utenti.id = utenti_FOREGIN AND utenti.username = '${proxy.recv.user}') and funzioni.isPrivate = 1;`, (err, resp, fields) => {
                let cats = new Map();
                if (resp && !err) {
                    for (let i = 0; i < resp.length; i++) {
                        if (!cats.has(resp[i].catName)) cats.set(resp[i].catName, {icon: resp[i].catIcon, fncs: []});
                        cats.get(resp[i].catName).fncs.push({
                            name: resp[i].titolo,
                            desc: resp[i].descrizione,
                            icon: resp[i].fncIcon,
                            to: resp[i].too,
                            tooltip: resp[i].tooltip,
                            modulename: resp[i].modulo
                        })
                    }
                    let ret = [];

                    cats.forEach((v, k) => {
                        ret.push({category: k, icon: v.icon, content: v.fncs})
                    });
                    proxy.send({state: true, ret: ret});
                    return;
                }
                console.log(err);
                proxy.send({state: false, err: "500"});
            });
        });
};
