import React from 'react'
import NavBar from "./components/NavBar";
import List from "@material-ui/core/es/List/List";
import {apiCalls, Currency, mqttServer, orderCifres, scontrinoModel} from "./consts";
import {withStyles} from '@material-ui/core/styles';
import * as mqtt from "mqtt";
import * as cfg from "./network.config"
import Drawer from "@material-ui/core/es/Drawer/Drawer";
import OrderListItem from "./components/OrderListItem";
import MenuIcon from "@material-ui/icons/Menu"
import IconButton from "@material-ui/core/es/IconButton/IconButton";
import AddIcon from "@material-ui/icons/Add";
import Grid from "@material-ui/core/es/Grid/Grid";
import Button from "@material-ui/core/es/Button/Button";
import {GET, POST} from "./network";
import Scontrino from "./components/Scontrino";
import {getBillData, renderCart} from "./Cart";
import Typography from "@material-ui/core/es/Typography/Typography";
import TextField from "@material-ui/core/es/TextField/TextField";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/es/DialogContentText/DialogContentText";
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import QrReader from "react-qr-reader";


const styles = theme => ({
    marginTop: {
        marginTop: 66,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden"
    },
    container: {
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        zIndex: -2,
    },
    cvs: {
        width: '100%',
        height: '100%',
        overflowX: 'hidden'
    },
    even: {
        backgroundColor: "#CCC"
    },
    paper: {
        padding: 10
    },
    scr: {
        height: 500
    },
    foo: {}
});

function getDate(unix_timestamp) {
    let date = new Date(unix_timestamp * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let day = "0" + date.getDate();
    let month = "0" + (date.getMonth() + 1);
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + " - " + day.substr(-2) + "/" + month.substr(-2);
}

class Self extends React.Component {

    state = {
        currentOrder: undefined,
        prodotti: {},
        payed: "0.00"
    };

    client = null;
    orders = {};
    clientid = "insecure=(";
    totale = [0, 0];
    scontrino = <Typography variant='title'>Getting order Number...</Typography>;
    ordnum = -1;

    genScontrino() {
        POST(apiCalls.getOrdNum, {
            user: window.ctx.get("username"),
            token: window.ctx.get("token")
        }).then(res => {
            if (res.state) {
                res = res.ordnum.pad(orderCifres);
                this.ordnum = res;
                let totale = "" + (this.totale[0] + Math.floor(this.totale[1] / 100) + "." + ("" + this.totale[1]).substr(-2));
                this.scontrino =
                    <Scontrino
                        path={scontrinoModel}
                        elementi={getBillData(this.state.flatted, true)}
                        kw={{
                            totale: this.state.usabuono ? this.state.faketotal : totale,
                            pagato: parseFloat(this.state.payed).toFixed(2),
                            resto: (-Math.floor(((this.totale[0] + this.totale[1] / 100) - parseFloat(this.state.payed)) * 100) / 100).toFixed(2),
                            qrdata: JSON.stringify({
                                num: this.state.ordernum,
                                time: Math.floor(Date.now() / 1000)
                            }),
                            buono: this.state.usabuono ? `BUONO ${this.state.buonoDesc}` : " ",
                            ordnum: res
                        }}
                    />;
                this.forceUpdate()
            }
        });
    }

    componentDidMount() {
        this.clientid = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
        GET(apiCalls.productList).then(res => {
            Object.keys(res.list).forEach(e => {
                let o = res.list[e];
                o.elements.forEach(k => this.state.prodotti[k.id] = {eur: k.eur, cents: k.cents, desc: k.desc})
            })
        });

        this.client = mqtt.connect(mqttServer);
        this.client.on('connect', () => {
            this.client.subscribe(cfg.mqtt["order-guest"], (e) => {
                console.log(e)
            });
            this.client.subscribe(cfg.mqtt["order-listmsg"], (e) => {
                console.log(e)
            });

            this.client.publish(cfg.mqtt["order-listmsg"], JSON.stringify({action: "req", client: that.clientid}))
        });

        let that = this;
        this.client.on('message', function (topic, message) {
            switch (topic) {
                case cfg.mqtt["order-guest"]:
                    let obj = JSON.parse(message.toString());
                    if (Math.floor(Date.now() / 1000) - obj.time > cfg.guest.timeout) return;
                    that.orders[obj.orderID] = obj;
                    break;
                case cfg.mqtt["order-listmsg"]:
                    let objj = JSON.parse(message.toString());
                    switch (objj.action) {
                        case "del":
                            objj = objj.data;
                            if (objj.host !== that.clientid) {
                                delete that.orders[objj.order];
                                that.forceUpdate();
                            }
                            break;
                        case "req":
                            that.client.publish(cfg.mqtt["order-listch"], JSON.stringify({
                                list: that.orders,
                                client: that.clientid,
                                required: objj.client,
                            }));
                            break;
                        case "set":
                            that.orders = objj.data.orders;
                            console.log([that.orders, objj]);
                            that.forceUpdate();
                            break;
                    }
                    break;
            }
        });
    }

    componentWillUnmount() {
        this.client.end();
    }

    selectOrder(e) {
        Object.keys(this.orders[e].cart).forEach(k => {
            this.orders[e].cart[k].forEach(e => {
                let cc = this.state.prodotti[e[1].id];
                this.totale = [this.totale[0] + cc.eur * e[1].qta, this.totale[1] + cc.cents * e[1].qta];
                Object.keys(cc).forEach(kk => e[1][kk] = cc[kk]);
            })
        });
        this.genScontrino();
        let fullArr = [];
        Object.keys(this.orders[e].cart).forEach(q => {
            fullArr.push(...this.orders[e].cart[q])
        });
        this.setState({btm: false, curOrdine: this.orders[e].cart, flatted: fullArr, ordernum: e})
    }

    render() {
        return (
            <div>
                <NavBar elements={[
                    <IconButton color="inherit" onClick={() => this.setState({btm: true})}>
                        <MenuIcon/>
                    </IconButton>,
                    <IconButton color="inherit" onClick={() => this.setState({top: true})}>
                        <AddIcon/>
                    </IconButton>
                ]} titleText='Cassa Self' history={this.props.history} showHome={true}/>

                {this.state.btm &&
                <Drawer anchor="bottom" open={this.state.btm} onClose={() => this.setState({btm: false})}>
                    <div
                        tabIndex={0}
                        role="button"
                        onClick={() => this.setState({btm: false})}
                        onKeyDown={() => this.setState({btm: false})}
                    >
                        <List>
                            {Object.keys(this.orders).reverse().map(e =>
                                <OrderListItem id={this.orders[e].ip} onClick={() => {
                                    this.selectOrder(e);
                                    this.setState({orderScanned: true})
                                }} ordnum={e} user={"guest"} time={this.orders[e].time}/>
                            )}
                        </List>
                    </div>
                </Drawer>}

                {this.state.top &&
                <Drawer anchor="top" open={this.state.top} onClose={() => this.setState({top: false})}>
                    <div
                        tabIndex={0}
                        role="top"
                        onClick={() => this.setState({top: false})}
                        onKeyDown={() => this.setState({top: false})}
                    >
                        {this.state.flatted && renderCart(this.state.flatted, this.props.classes, this, true, false)}
                    </div>
                </Drawer>}

                {this.state.orderScanned &&
                <Grid container spacing={24} className={this.props.classes.marginTop}>
                    <Grid item xs={12} md={8}>
                        {this.scontrino}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Button className={this.props.classes.bigb} fullWidth variant="contained" color="primary"
                                onClick={() => {
                                    this.forceUpdate();
                                    this.client.publish(cfg.mqtt["order-official"], JSON.stringify(
                                        {
                                            cart: this.state.curOrdine,
                                            orderID: this.state.ordernum,
                                            asporto: this.orders[this.state.ordernum].asporto,
                                            message: this.orders[this.state.ordernum].message,
                                            ip: "self",
                                            user: "Operator self",
                                            buono: this.state.usabuono,
                                            buonoID: this.state.buonoId,
                                            time: Math.floor(Date.now() / 1000),
                                            ordnum: this.ordnum,
                                            totale: this.totale
                                        }));
                                    this.setState({orderScanned: false});
                                    document.getElementById("tobeprinted").postMessage({type: 'print'});
                                    delete this.orders[this.state.ordernum];
                                    this.client.publish(cfg.mqtt["order-listmsg"], JSON.stringify({
                                        action: "del",
                                        data: {
                                            host: this.clientid,
                                            order: this.state.ordernum
                                        }
                                    }));
                                }}>stampa</Button>
                        <Button className={this.props.classes.bigb} fullWidth variant="contained" color="secondary"
                                onClick={() => {
                                    this.setState({orderScanned: false})
                                }}>ANNULLA</Button>
                        <Button className={this.props.classes.bigb} fullWidth variant="contained" color="secondary"
                                onClick={() => {
                                    this.setState({buonoOpen: true})
                                }}>Usa un buono</Button>
                        <TextField
                            label="Pagato"
                            rowsMax="6"
                            value={this.state.payed}
                            onChange={(evt) => this.setState({payed: evt.target.value})}
                            className={this.props.classes.textField}
                            margin="normal"
                            variant="outlined"
                        />
                        <Typography
                            variant="title">Resto: {-Math.floor(((this.totale[0] + this.totale[1] / 100) - parseFloat(this.state.payed)) * 100) / 100} {Currency}</Typography>
                    </Grid>

                </Grid>
                }
                <Dialog
                    open={this.state.buonoOpen}
                    onClose={() => this.setState({buonoOpen: false})}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Dettagli buono</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Inserisci i dettagli del buono
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Numero"
                            onChange={(e) => this.setState({buonoId: e.target.value})}
                        />
                        <Button onClick={() => {
                            POST(apiCalls.buono, {
                                user: window.ctx.get("username"),
                                token: window.ctx.get("token"),
                                id: this.state.buonoId
                            }).then(res => {
                                if (res.state) {
                                    if (this.totale[0] + this.totale[1] / 100 < res.minimo) {
                                        alert(`Minimo non rispettato: spesa minima di ${res.minimo} EUR`);
                                    } else {
                                        if (res.tipo === 1) {
                                            this.state.faketotal = "0.00";
                                            this.state.buonoDesc = (-this.totale[0] + this.totale[1] / 100).toFixed(2) + Currency
                                        }
                                        else if (res.tipo === 2) {
                                            this.state.faketotal = (this.totale[0] + this.totale[1] / 100 - res.valore).toFixed(2);
                                            this.state.buonoDesc = (-res.valore).toFixed(2) + Currency
                                        }
                                        else if (res.tipo === 3) {
                                            this.state.faketotal = (this.totale[0] + this.totale[1] / 100 - res.valore * (this.totale[0] + this.totale[1] / 100) / 100).toFixed(2);
                                            this.state.buonoDesc = (-res.valore).toFixed(2) + "%"
                                        }
                                        this.setState({buonoapplicabile: false})
                                    }
                                } else alert("Buono non trovato.")
                            })
                        }} color="primary">
                            Cerca
                        </Button>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({buonoOpen: false, buonoId: ""})} color="primary">
                            Annulla
                        </Button>
                        <Button disabled={this.state.buonoapplicabile} onClick={() => {
                            this.setState({buonoapplicabile: true, usabuono: true, buonoOpen: false});
                            this.genScontrino()
                        }} color="primary">
                            Inserisci
                        </Button>
                    </DialogActions>
                </Dialog>

                {!this.state.orderScanned && <QrReader className={this.props.classes.marginTop}
                                                       delay={500}
                                                       onError={(e) => {
                                                       }}
                                                       onScan={(e) => {
                                                           try {
                                                               let o = JSON.parse(e);
                                                               if (o.orderID && this.orders[o.orderID]) {
                                                                   this.selectOrder(o.orderID)
                                                               }
                                                               this.setState({orderScanned: true})
                                                           } catch (e) {

                                                           }
                                                       }}
                                                       style={{width: "100%"}}
                />}

            </div>)
            ;
    }
}

let classe = withStyles(styles)(Self);
export {classe}
export default withStyles(styles)(Self)