import {Currency} from "./consts";
import Paper from "@material-ui/core/es/Paper/Paper";
import Grid from "@material-ui/core/es/Grid/Grid";
import React from "react";
import Button from "@material-ui/core/es/Button/Button";
import AddIcon from "@material-ui/icons/Add"
import MinusIcon from "@material-ui/icons/Remove"
import Typography from "@material-ui/core/es/Typography/Typography";

let normalizeCart = (cart) => {
    let map = new Map();
    cart.forEach(e => {
        if (typeof(e.variant) === "undefined" && !map.has(e.desc)) map.set(e.desc, {
            qta: e.qta,
            eur: e.eur,
            cents: e.cents
        });
        else if (typeof(e.variant) === "undefined") map.get(e.desc).qta = e.qta;
        else if (!map.has(e.desc)) map.set(e.desc, {
            qta: e.qta,
            eur: e.eur,
            cents: e.cents,
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
            map.get(e.desc).variants.push({qta: e.qta, eur: e.eur, cents: e.cents, var: e.variant})
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

let renderCart = (cart, classes, classs) => {
    let tote = 0, totc = 0;
    return (
        <Paper className={classes.paper}>
            <Grid container spacing={24}>
                {[...normalizeCart(cart)].map(e => {
                    let k = e[0], v = e[1];
                    tote += parseInt(v.eur) * v.qta;
                    totc += parseInt(v.cents) * v.qta;
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
                                        <Button onClick={() => {
                                            for (let i = 0; i < cart.length; i++)
                                                if (cart[i].desc === k) {
                                                    cart[i].qta++;
                                                    break;
                                                }
                                            classs.forceUpdate()
                                        }} variant="contained" color="primary"><AddIcon/></Button>
                                    </Grid>,
                                    <Grid item xs={2}>
                                        <Button onClick={() => {
                                            for (let i = 0; i < cart.length; i++)
                                                if (cart[i].desc === k) {
                                                    cart[i].qta > 0 ? cart[i].qta-- : console.log("Coglione non si va sotto zero =)");
                                                    break;
                                                }
                                            classs.forceUpdate()
                                        }} variant="contained" color="secondary"><MinusIcon/></Button>
                                    </Grid>
                                ]}
                                {!typeof(v.variants) === 'undefined' && <Grid item xs={4}/>}
                                {typeof(v.variants) !== 'undefined' && v.variants.map(e => {
                                    if (e.qta > 0)
                                        return [
                                            <Grid item xs={1}/>,
                                            <Grid item xs={4}>
                                                {e.var.choose !== null && <Typography>{e.var.choose}</Typography>}
                                                {typeof(e.var.select.labels) !== 'undefined' && <Typography>{e.var.select.labels.map((q, i) => (e.var.select.values[i] === true ? "CON " : "NO ") + q + ", ")}</Typography>}
                                            </Grid>,
                                            <Grid item xs={1}>
                                                <Typography>{e.qta}</Typography>
                                            </Grid>,
                                            <Grid item xs={2}/>,
                                            <Grid item xs={2}>
                                                <Button onClick={() => {
                                                    for (let i = 0; i < cart.length; i++)
                                                        if (cart[i].desc === k && cart[i].variant === e.var) cart[i].qta++;
                                                    classs.forceUpdate()
                                                }} variant="contained" color="primary"><AddIcon/></Button>
                                            </Grid>,
                                            <Grid item xs={2}>
                                                <Button onClick={() => {
                                                    for (let i = 0; i < cart.length; i++)
                                                        if (cart[i].desc === k && cart[i].variant === e.var) cart[i].qta > 0 ? cart[i].qta-- : console.log("Coglione non si va sotto zero =)");
                                                    classs.forceUpdate()
                                                }} variant="contained" color="secondary"><MinusIcon/></Button>
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

let getBillData = (cart) => {
    let elem = [];
    [...normalizeCart(cart)].forEach(e => {
        let k = e[0], v = e[1];
        elem.push({qta: "" + v.qta, text: k, total: v.eur + "." + (v.cents > 9 ? v.cents : "0" + v.cents)});
        // if(typeof(v.variants) !== 'undefined'){
        //     v.variants.forEach(e => {
        //         elem.push({qta: "  " + e.qta, text: e.var.choose !== null ? e.var.choose : e.var.select.labels.map((q, i) => (e.var.select.values[i] === true ? "CON " : "NO ") + q + ", "), total: ""});
        //     })
        // }
    });
    return elem;
};

export {getBillData, getCartLenght, getTotal, normalizeCart, renderCart}