const {getConnection} = require("./mysql");
const {onUserAuthenticated} = require("./auth");

const queries = [
    {
        group: "ads",
        name: "visualizzazioni",
        type: "bar",
        query: () => "SELECT `desc` as label, ads.total_visualization as y FROM ads WHERE 1;"
    },
    {
        group: "coupons",
        name: "usati per data e tipo",
        type: "line",
        series: "tipo",
        query: (fromTime, toTime) => `SELECT COUNT(usato) as y, DATE(FROM_UNIXTIME(usato)) as label, cupons_types.descrizione as tipo FROM cupons, cupons_types WHERE cupons_types.id = tipo AND usato > ${fromTime} AND usato < ${toTime} AND usato > 0 GROUP BY DATE(FROM_UNIXTIME(usato)), tipo;\n`
    },
    {
        group: "coupons",
        name: "usati per giorno della settimana e tipo",
        type: "line",
        series: "tipo",
        query: (fromTime, toTime) => `SELECT COUNT(usato) as y, DAYOFWEEK(FROM_UNIXTIME(usato)) as label, cupons_types.descrizione as tipo FROM cupons, cupons_types WHERE cupons_types.id = tipo AND usato > ${fromTime} AND usato < ${toTime} AND usato > 0 GROUP BY DAYOFWEEK(FROM_UNIXTIME(usato)), tipo;\n`
    },
    {
        group: "coupons",
        name: "usati per data",
        type: "line",
        series: "totali",
        query: (fromTime, toTime) => `SELECT COUNT(usato) as y, DATE(FROM_UNIXTIME(usato)) as label, 'Totale' as totali FROM cupons WHERE usato > ${fromTime} AND usato < ${toTime} AND usato > 0 GROUP BY DATE(FROM_UNIXTIME(usato));\n`
    },
    {
        group: "coupons",
        name: "usati per giorno della settimana",
        type: "bar",
        query: (fromTime, toTime) => `SELECT COUNT(usato) as y, DAYOFWEEK(FROM_UNIXTIME(usato)) as label FROM cupons WHERE usato > 0 AND usato > ${fromTime} AND usato < ${toTime} GROUP BY DAYOFWEEK(FROM_UNIXTIME(usato));\n`
    },
    {
        group: "coupons",
        name: "totale concesso",
        type: "value",
        measure: "EUR",
        query: (fromTime, toTime) => `SELECT SUM(CASE WHEN tipo = 1 THEN valore_venduto WHEN tipo = 2 THEN CASE WHEN valore < valore_venduto THEN valore ELSE valore_venduto END WHEN tipo = 3 THEN (valore_venduto / 100) * valore END) as value FROM cupons WHERE usato > ${fromTime} AND usato < ${toTime};\n`
    },
    {
        group: "coupons",
        name: "totale buoni distribuiti per tipo",
        type: "comparation",
        query: () => "SELECT SUM(tipo = 1) as usati_1, SUM(tipo = 2) as usati_2, SUM(tipo = 3) as usati_3 FROM cupons;\n"
    },
    {
        group: "coupons",
        name: "totale incassi contro concesso",
        type: "comparation",
        query: (fromTime, toTime) => `SELECT SUM(magazzino.prezzoCents) / 100 + SUM(magazzino.prezzoEur) as totale, (SELECT SUM(CASE WHEN tipo = 1 THEN valore_venduto WHEN tipo = 2 THEN CASE WHEN valore < valore_venduto THEN valore ELSE valore_venduto END WHEN tipo = 3 THEN (valore_venduto / 100) * valore END) FROM cupons WHERE usato > ${fromTime} AND usato < ${toTime}) as concesso from ordini_dettagli, ordini_prodotti inner join magazzino on ordini_prodotti.product = magazzino.id where ordini_dettagli.id = ordini_prodotti.\`order\` AND \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime};\n`
    },
    {
        group: "ordini",
        name: "ordini per data",
        type: "line",
        series: "totali",
        query: (fromTime, toTime) => `SELECT COUNT(\`timestamp\`) as y, DATE(FROM_UNIXTIME(\`timestamp\`)) as label, 'Totale' as totali FROM ordini_dettagli WHERE \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} GROUP BY DATE(FROM_UNIXTIME(\`timestamp\`));`
    },
    {
        group: "ordini",
        name: "ordini per data e utente",
        type: "line",
        series: "user",
        query: (fromTime, toTime) => `SELECT COUNT(\`timestamp\`) as y, DATE(FROM_UNIXTIME(\`timestamp\`)) as label, user FROM ordini_dettagli WHERE \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} GROUP BY DATE(FROM_UNIXTIME(\`timestamp\`)), user;\n`
    },
    {
        group: "ordini",
        name: "ordini per utente",
        type: "bar",
        query: (fromTime, toTime) => `SELECT COUNT(\`timestamp\`) as y, user as label FROM ordini_dettagli WHERE \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} GROUP BY user;\n`
    },
    {
        group: "ordini",
        name: "ordini per giorno della settimana",
        type: "bar",
        query: (fromTime, toTime) => `SELECT COUNT(\`timestamp\`) as y, DAYOFWEEK(FROM_UNIXTIME(\`timestamp\`)) as label FROM ordini_dettagli WHERE \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} GROUP BY DAYOFWEEK(FROM_UNIXTIME(\`timestamp\`));\n`
    },
    {
        group: "ordini",
        name: "ordini per giorno della settimana e utente",
        type: "line",
        series: "user",
        query: (fromTime, toTime) => `SELECT COUNT(\`timestamp\`) as y, DAYOFWEEK(FROM_UNIXTIME(\`timestamp\`)) as label, user FROM ordini_dettagli WHERE \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} GROUP BY DAYOFWEEK(FROM_UNIXTIME(\`timestamp\`)), user;\n`
    },
    {
        group: "ordini",
        name: "ordini totali contro asporto",
        type: "comparation",
        query: (fromTime, toTime) => `SELECT SUM(asporto = 0) as loco, SUM(asporto > 0) as asporto FROM ordini_dettagli WHERE \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime};\n`
    },
    {
        group: "ordini",
        name: "incassi per utente",
        type: "bar",
        query: (fromTime, toTime) => `SELECT SUM(magazzino.prezzoCents) / 100 + SUM(magazzino.prezzoEur) as y, user as label from ordini_dettagli, ordini_prodotti inner join magazzino on ordini_prodotti.product = magazzino.id where ordini_dettagli.id = ordini_prodotti.\`order\` AND \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} group by user;\n`
    },
    {
        group: "ordini",
        name: "incassi per utente per data",
        type: "line",
        series: "user",
        query: (fromTime, toTime) => `SELECT DATE(FROM_UNIXTIME(\`timestamp\`)) as label, SUM(magazzino.prezzoCents) / 100 + SUM(magazzino.prezzoEur) as y, user from ordini_dettagli, ordini_prodotti inner join magazzino on ordini_prodotti.product = magazzino.id where ordini_dettagli.id = ordini_prodotti.\`order\`  AND \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} group by user, DATE(FROM_UNIXTIME(\`timestamp\`));\n`
    },
    {
        group: "ordini",
        name: "incassi per utente per giorno della settimana",
        type: "line",
        series: "user",
        query: (fromTime, toTime) => `SELECT DAYOFWEEK(FROM_UNIXTIME(\`timestamp\`)) as label, SUM(magazzino.prezzoCents) / 100 + SUM(magazzino.prezzoEur) as y, user from ordini_dettagli, ordini_prodotti inner join magazzino on ordini_prodotti.product = magazzino.id where ordini_dettagli.id = ordini_prodotti.\`order\` AND \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} group by user, DAYOFWEEK(FROM_UNIXTIME(\`timestamp\`));\n`
    },
    {
        group: "ordini",
        name: "piatti totali",
        type: "value",
        measure: "PIATTI",
        query: (fromTime, toTime) => `SELECT SUM(qta) as value FROM ordini_prodotti, ordini_dettagli where ordini_prodotti.\`order\` = ordini_dettagli.id AND \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime};`
    },
    {
        group: "ordini",
        name: "piatti totali per pietanza",
        type: "bar",
        query: (fromTime, toTime) => `SELECT COALESCE(SUM(qta*(SELECT \`timestamp\` > ${fromTime} AND \`timestamp\` < ${toTime} FROM ordini_dettagli WHERE id = \`order\`)), 0) as y, magazzino.descrizione as label from ordini_prodotti right join magazzino on ordini_prodotti.product = magazzino.id  GROUP BY magazzino.descrizione;\n`
    }

];

function get_stats(req, res) {
    onUserAuthenticated(req, res, (data) => {
        console.log(data);
        let ret = {};
        let queriesT = "";
        queries.forEach((e, i) => {
            queriesT += e.query(data.fromTime, data.toTime) + "\n"
        });
        getConnection().query(queriesT, (er, r) => {
            if (!r || er) {
                res.send({state: false, err: er});
                return;
            }
            let q = JSON.parse(JSON.stringify(queries));
            res.send({
                state: true,
                obj: r.map((query, i) => {
                    q[i].query = query;
                    return q[i];
                })
            })
        })
    }, ["STATISTICHE"]);
}

module.exports.get_stats = get_stats;
