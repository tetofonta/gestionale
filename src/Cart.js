import {Currency} from "./consts";
import Paper from "@material-ui/core/es/Paper/Paper";
import Grid from "@material-ui/core/es/Grid/Grid";
import React from "react";
import Button from "@material-ui/core/es/Button/Button";
import AddIcon from "@material-ui/icons/Add"
import MinusIcon from "@material-ui/icons/Remove"
import Typography from "@material-ui/core/es/Typography/Typography";
import * as cfg from "./network.config"

let normalizeCart = (cart) => {
    let map = new Map();
    cart.forEach(e => {
        if (typeof(e.variant) === "undefined" && !map.has(e.desc)) map.set(e.desc, {
            id: e.id,
            qta: e.qta,
            eur: e.eur,
            cents: e.cents,
            cat: e.cat
        });
        else if (typeof(e.variant) === "undefined") map.get(e.desc).qta = e.qta;
        else if (!map.has(e.desc)) map.set(e.desc, {
            id: e.id,
            qta: e.qta,
            eur: e.eur,
            cents: e.cents,
            cat: e.cat,
            variants: [{qta: e.qta, var: e.variant}]
        });
        else if (typeof(map.get(e.desc).variants) === "undefined") {
            map.get(e.desc).variants = [{
                qta: e.qta,
                var: e.variant
            }];
            map.get(e.desc).qta += e.qta
        }
        else {
            map.get(e.desc).variants.push({qta: e.qta, eur: e.eur, cents: e.cents, var: e.variant});
            map.get(e.desc).qta += e.qta
        }
    });
    return map;
};

let getCartLenght = (cart) => {
    let map = normalizeCart(cart);
    let len = 0;
    map.forEach((v, k) => len += v.qta);
    return len;
};

let total = [0, 0];

let getTotal = (cart) => {
    total = [0, 0];
    [...normalizeCart(cart)].map(e => {
        let k = e[0], v = e[1];
        total[0] += parseInt(v.eur) * v.qta;
        total[1] += parseInt(v.cents) * v.qta;
    });

    total[0] = (total[0] + Math.floor(total[1] / 100));
    total[1] = total[1] % 100;

    return [total[0] + "." + (total[1] > 9 ? total[1] : "0" + total[1]), total];
};

let renderCart = (cart, classes, classs, normalized=false, withButtons=true) => {
    if(!cart) return {};
    let mc = JSON.parse(JSON.stringify(cart));
    if(!normalized) mc = [...normalizeCart(mc)];
    let tote = 0, totc = 0;
    return (
        <Paper className={classes.paper}>
            <Grid container spacing={24}>
                {mc.map((e, idx) => {
                    let k = e[0], v = e[1];
                    tote += parseInt(v.eur) * v.qta;
                    totc += parseInt(v.cents) * v.qta;
                    if (v.qta < 1) {
                        cart.splice(idx, 1);
                        classs.forceUpdate()
                    }
                    return (
                        <Grid item xs={12}>
                            <Grid container spacing={24}>
                                <Grid item xs={5}>
                                    <Typography>{k}</Typography>
                                </Grid>
                                <Grid item xs={1}>
                                    <Typography>{v.qta}</Typography>
                                </Grid>
                                <Grid item xs={2}>
                                    <Typography>{v.eur + "." + (v.cents > 9 ? v.cents : "0" + v.cents) + " " + Currency}</Typography>
                                </Grid>
                                {typeof(v.variants) === 'undefined' &&
                                [
                                    <Grid item xs={2}>
                                        {withButtons && <Button onClick={() => {
                                            for (let i = 0; i < cart.length; i++)
                                                if (cart[i].desc === k) {
                                                    cart[i].qta++;
                                                    break;
                                                }
                                            classs.forceUpdate()
                                        }} variant="contained" color="primary"><AddIcon/></Button>}
                                    </Grid>,
                                    <Grid item xs={2}>
                                        {withButtons && <Button onClick={() => {
                                            for (let i = 0; i < cart.length; i++)
                                                if (cart[i].desc === k) {
                                                    cart[i].qta > 0 ? cart[i].qta-- : cart.splice(i, 1);
                                                    break;
                                                }
                                            classs.forceUpdate()
                                        }} variant="contained" color="secondary"><MinusIcon/></Button>}
                                    </Grid>
                                ]}
                                {!typeof(v.variants) === 'undefined' && <Grid item xs={4}/>}
                                {typeof(v.variants) !== 'undefined' && v.variants.map(e => {
                                    if (e.qta > 0)
                                        return [
                                            <Grid item xs={1}/>,
                                            <Grid item xs={4}>
                                                {e.var.choose !== null && <Typography>{e.var.choose}</Typography>}
                                                {typeof(e.var.select.labels) !== 'undefined' &&
                                                <Typography>{e.var.select.labels.map((q, i) => (e.var.select.values[i] === true ? "CON " : "NO ") + q + ", ")}</Typography>}
                                            </Grid>,
                                            <Grid item xs={1}>
                                                <Typography>{e.qta}</Typography>
                                            </Grid>,
                                            <Grid item xs={2}/>,
                                            <Grid item xs={2}>
                                                {withButtons && <Button onClick={() => {
                                                    for (let i = 0; i < cart.length; i++)
                                                        if (cart[i].desc === k && cart[i].variant === e.var) cart[i].qta++;
                                                    classs.forceUpdate()
                                                }} variant="contained" color="primary"><AddIcon/></Button>}
                                            </Grid>,
                                            <Grid item xs={2}>
                                                {withButtons && <Button onClick={() => {
                                                    for (let i = 0; i < cart.length; i++)
                                                        if (cart[i].desc === k && cart[i].variant === e.var) cart[i].qta > 0 ? cart[i].qta-- : cart.splice(i, 1);
                                                    classs.forceUpdate()
                                                }} variant="contained" color="secondary"><MinusIcon/></Button>}
                                            </Grid>
                                        ]
                                })}
                            </Grid>
                        </Grid>
                    );
                })}
                <Grid item xs={12}/>
            </Grid>
        </Paper>
    )
};

let getBillData = (cart, normalized=true) => {
    if(!cart) return {};
    let mc = JSON.parse(JSON.stringify(cart));
    if(!normalized) mc = [...normalizeCart(mc)];
    let o = {};
    Object.keys(cfg.react.scontrini).forEach(e => {
        let m = mc.filter(q => cfg.react.scontrini[e].includes(q[1].cat));
        o[e] = m.map(e => {
            let k = e[0], v = e[1];
            return ({qta: "" + v.qta, text: k, total: v.eur + "." + (v.cents > 9 ? v.cents : "0" + v.cents)});
        });
    });
    return o;
};


let getCarts = (cart, normalized=true) => {
    if(!cart) return {};
    let mc = JSON.parse(JSON.stringify(cart));
    if(!normalized) mc = [...normalizeCart(mc)];
    let obj = {};
    Object.keys(cfg.react.scontrini).forEach(e => {
        obj[e] = mc.filter(q => cfg.react.scontrini[e].includes(q[1].cat));
    });
    return obj;
};

export {
    getBillData,
    getCartLenght,
    getTotal,
    normalizeCart,
    renderCart,
    getCarts
}