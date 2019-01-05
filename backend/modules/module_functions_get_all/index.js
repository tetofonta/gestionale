
module.exports.callback = function (proxy) {
    if (proxy.getNW()) {
        proxy.getConnection().query(`SELECT moduleName, \`to\` as too, isPublic, isPrivate FROM funzioni WHERE 1`, (e, r) => {
            if (!r || e) {
                console.error(e);
                proxy.send({state: false, err: e.toString()});
                return;
            }

            let privates = [];
            let publics = [];

            r.forEach(e => {
                if (e.isPublic) publics.push(e);
                else if (e.isPrivate) privates.push(e);
            });

            proxy.send({state: true, publics: publics, privates: privates})
        })
    } else {
        proxy.getConnection().query(`SELECT moduleName, \`to\` as too, isPublic, 0 as isPrivate FROM funzioni WHERE isPublic = 1`, (e, r) => {
            if (!r || e) {
                console.error(e);
                proxy.send({state: false, err: e.toString()});
                return;
            }

            let privates = [];
            let publics = [];

            r.forEach(e => {
                if (e.isPublic) publics.push(e);
                else if (e.isPrivate) privates.push(e);
            });

            proxy.send({state: true, publics: publics, privates: privates})
        })
    }

}