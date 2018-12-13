const {getConnection} = require("./mysql");

function getSuitable(startArr, max, MAXR, cb) {
    if (MAXR === 0) return startArr;
    getConnection().query(`SELECT id, image_src FROM ads WHERE MOD(visualized, rank+1) < rank LIMIT ${max}`, (err, r, f) => {
        if (r && !err) {
            let firstqry = "0";
            r.forEach(e => {
                startArr.push(e.image_src);
                firstqry += ` OR id=${e.id}`;
            });
            getConnection().query(`UPDATE ads SET visualized=visualized+1, total_visualization WHERE ${firstqry}`, (err, re, f) => {
                if (startArr.length < max) {
                    let qry = "1";
                    r.forEach(e => qry += ` AND id != ${e.id}`);
                    getConnection().query(`UPDATE ads SET visualized = 0 WHERE ${qry}`, (err, r, f) => {
                        getSuitable(startArr, max - startArr.length, MAXR - 1, cb)
                    });
                } else {
                    cb(startArr);
                }
            })
        }
    })
}

module.exports.get_most_suitable_ads = (req, res) => {
    getSuitable([], 2, 10, (ret) => {
        if (ret.length < 2) {
            res.send({state: false, err: "500"});
            return;
        }
        res.send({state: true, ads: ret})
    });
};