const {onUserAuthenticated} = require("./auth");

const {getConnection, secure} = require("./mysql");

function getSuitable(startArr, max, MAXR, cb) {
    if (MAXR === 0) return startArr;
    getConnection().query(`SELECT id, image_src FROM ads WHERE MOD(visualized, rank+1) < rank LIMIT ${max}`, (err, r, f) => {
        if (r && !err) {
            let firstqry = "0";
            r.forEach(e => {
                startArr.push(e.image_src);
                firstqry += ` OR id=${e.id}`;
            });
            getConnection().query(`UPDATE ads SET visualized=visualized+1, total_visualization=total_visualization+1 WHERE ${firstqry}`, (err, re, f) => {
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

module.exports.get_ads = (req, res) => {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`SELECT id, \`desc\`, rank, image_src FROM ads;`, (e, r, f) => {
            if(!r || e){
                res.send({state: false, err: e});
                return;
            }
            res.send({state: true, ret: r})
        })
    }, ["AMMINISTRAZIONE"])
};

module.exports.edit_ads = (req, res) => {
    onUserAuthenticated(req, res, (data) => {
        console.log(data);
        data.edited.forEach(e => {
            getConnection().query(`INSERT INTO ads(\`desc\`, rank, visualized, image_src, total_visualization) VALUES ('${secure(e.desc)}', ${secure(e.rank)}, 0, '${secure(e.image_src)}', 0)  ON DUPLICATE KEY UPDATE rank = ${e.rank}, \`desc\` = '${secure(e.desc)}', image_src='${secure(e.image_src)}'`);
        });
    }, ["AMMINISTRAZIONE"])
};

module.exports.delete_ads = (req, res) => {
    onUserAuthenticated(req, res, (data) => {
        getConnection().query(`DELETE FROM ads WHERE id = ${secure(data.id)}`)
    }, ["AMMINISTRAZIONE"])
};