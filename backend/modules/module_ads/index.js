let connection;

function getSuitable(proxy, startArr, max, MAXR, cb) {
    if (MAXR === 0) return startArr;
    proxy.getConnection().query(`SELECT id, image_src FROM ads WHERE MOD(visualized, rank+1) < rank LIMIT ${max}`, (err, r, f) => {
        if (r && !err) {
            let firstqry = "0";
            r.forEach(e => {
                startArr.push(e.image_src);
                firstqry += ` OR id=${e.id}`;
            });
            proxy.getConnection().query(`UPDATE ads SET visualized=visualized+1, total_visualization=total_visualization+1 WHERE ${firstqry}`, (err, re, f) => {
                if (startArr.length < max) {
                    let qry = "1";
                    r.forEach(e => qry += ` AND id != ${e.id}`);
                    proxy.getConnection().query(`UPDATE ads SET visualized = 0 WHERE ${qry}`, (err, r, f) => {
                        getSuitable(proxy, startArr, max - startArr.length, MAXR - 1, cb)
                    });
                } else {
                    cb(startArr);
                }
            })
        }
    })
}

module.exports.callback = (proxy) => {
    getSuitable(proxy, [], 2, 10, (ret) => {
        if (ret.length < 2) {
            proxy.send({state: false, err: "500"});
            return;
        }
        proxy.send({state: true, ads: ret})
    });
};