const {getNW}  = require("./network");
const crypto = require('crypto');
const {getUsers} = require("./auth");
const {getConnection} = require("./mysql");

let currentno = 0;
let accessing = false;

function increment(req, res) {
    if (getNW(req)) {

        let data = req.body;
        console.log(data);
        try {
            data.user = data.user.replaceAll("'", "");
            data.token = data.token.replaceAll("'", "");
            console.log(data);
            console.log(data.user);
            console.log(data.token);
            console.log(getUsers().get(data.user));
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

        while(accessing);
        accessing = true;
        let no = currentno++;
        accessing = false;

        res.send({state: true, ordnum: no});

        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

function get_buono_detail(req, res) {
    if (getNW(req)) {

        let data = req.body;
        console.log(data);
        try {
            data.user = data.user.replaceAll("'", "");
            data.token = data.token.replaceAll("'", "");
            console.log(data);
            console.log(data.user);
            console.log(data.token);
            console.log(getUsers().get(data.user));
        } catch (e) {
            res.send({state: false, err: "500"});
            return;
        }

        if (getUsers().get(data.user) !== data.token) {
            res.send({state: false, err: "Access denied."});
            return;
        }

        getConnection().query(`SELECT tipo, valore, minimo FROM cupons WHERE usato = 0 AND id = ${data.id}`, (e, r, f) => {
            if(r.length < 1){
                res.send({state: false, err: ""});
                return;
            }
            if(r && !e){
                res.send({state: true, tipo: r[0].tipo, valore: r[0].valore, minimo: r[0].minimo});
                return;
            }
            res.send({state: false, err: ""})
        });

        return;
    }
    res.send({state: false, err: "Access denied from guest network."})
}

module.exports.increment = increment;
module.exports.get_buono_detail = get_buono_detail;