const {getConnection} = require("../mysql");

let currentno = 0;
let accessing = false;

getConnection().query(`SELECT ordnum FROM ordini_dettagli WHERE \`timestamp\` = (SELECT MAX(\`timestamp\`) FROM ordini_dettagli) LIMIT 1`, (e, r) => {
    if (!r || e) return;
    currentno = r[0].ordnum;
});

function operateNo(req, res) {
    let data = req.body;
    if (data.set)
        if (!isNaN(parseInt(data.value))) {
            currentno = parseInt(data.value);
            res.send({state: true, err: "ok"});
        }
        else res.send({state: false, err: "Il valore non é un numero."});
    else res.send({state: true, num: currentno});
}

function increment(req, res) {
    while (accessing) ;
    accessing = true;
    let no = currentno++;
    accessing = false;

    res.send({state: true, ordnum: no});
}

module.exports.operateNo = operateNo;
module.exports.increment = increment;