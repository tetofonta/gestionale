import React from "react";
import NavBar from './components/NavBar'
import {apiCalls, CategoryWidth, Currency, mqttServer, orderCifres, ProductsWidth, scontrinoModel} from "./consts";
import Grid from "@material-ui/core/es/Grid/Grid";
import {withStyles} from '@material-ui/core/styles';
import {GET, GETSync, POST} from "./network";
import Typography from "@material-ui/core/es/Typography/Typography";
import Paper from "@material-ui/core/es/Paper/Paper";
import Button from "@material-ui/core/es/Button/Button";
import AddIcon from "@material-ui/icons/Add"
import SendIcon from "@material-ui/icons/Send"
import CartIcon from "@material-ui/icons/ShoppingCart"
import MinusIcon from "@material-ui/icons/Remove"
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import FormControlLabel from "@material-ui/core/es/FormControlLabel/FormControlLabel";
import RadioGroup from "@material-ui/core/es/RadioGroup/RadioGroup";
import Radio from "@material-ui/core/es/Radio/Radio";
import Checkbox from "@material-ui/core/es/Checkbox/Checkbox";
import TextField from "@material-ui/core/es/TextField/TextField";
import Stepper from "@material-ui/core/es/Stepper/Stepper";
import Step from "@material-ui/core/es/Step/Step";
import StepButton from "@material-ui/core/es/StepButton/StepButton";
import ImageButton from "./components/imageButton"
import ProductTile from "./components/ProductTile";
import IconButton from "@material-ui/core/es/IconButton/IconButton";
import Badge from "@material-ui/core/es/Badge/Badge";
// noinspection ES6CheckImport
import mqtt from "mqtt"
import QRCode from "qrcode.react"
import Scontrino from "./components/Scontrino";
import {getBillData, getCartLenght, getCarts, getTotal, normalizeCart, renderCart} from "./Cart";
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import DialogContentText from "@material-ui/core/es/DialogContentText/DialogContentText";
import * as cfg from "./configs/network.config"

const styles = theme => ({
    marginTop: {
        marginTop: 66,
        width: "100vw",
        height: "calc(100vh - 135px)",
        overflowY: "auto"
    },
    bigb: {
        height: '33%'
    },
    full: {
        width: "100vw",
        height: "calc(100vh - 150px)",
        overflowY: "auto"
    },
    marginTopNoX: {
        marginTop: 64,
        width: "100vw",
        height: "calc(100vh - 150px)",
        overflowX: 'hidden',
        backgroundColor: cfg.react.theme === "light" ? "#eee" : "#202020"
    },
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 300,
        width: '100%',
        overflow: 'hidden'
    },
    paperTitle: {
        padding: '15px',
        textAlign: 'center',
        margin: 0,
        width: '100%'
    },
    btn: {
        width: '100%',
        minWidth: 200,
        margin: 12
    },
    step: {
        height: 72
    },
    cartabtn: {
        width: '100%',
        height: '70px'
    },
    badge: {
        top: 1,
        right: -15,
        // The border color match the background color.
        border: `2px solid ${
            theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
            }`,
    },
    textField: {
        width: '100%'
    },
    extendedIcon: {
        marginRight: theme.spacing.unit,
    },
    paper: {
        marginLeft: '15px',
        marginRight: '5px',
        marginBottom: '5px',
        marginTop: '30px'
    },
    centred: {
        margin: "auto",
        display: "block",
        marginTop: "40px"
    },
    qrcode: {
        backgroundColor: "#fff",
        padding: 50
    }
});

class Cassa extends React.Component {

    status = {
        category: 0,
        product: 1,
        review: 2,
        code: 3,
    };

    state = {
        cart: [],

        currentState: this.status.category,
        currentList: [],
        currentDetail: [],
        isAddOpen: false,
        lastEdited: {},

        dialogState: [],
        quantity: 1,
        selectSelected: undefined,
        step: 0,

        note: "",
        isAsporto: false,

        ordernum: "ssss",
        payed: "00.00",

        buonoOpen: false,
        buonoId: "",
        buonoDesc: "",
        buonoapplicabile: true,
        usabuono: false,
        faketotal: 0
    };

    images = [];

    total = [0, 0];

    ip = "unavailable";

    normalizeCart = () => {
        return normalizeCart(this.state.cart)
    };

    getCartLenght = () => {
        return getCartLenght(this.state.cart);
    };

    getTotal = () => {
        let t = getTotal(this.state.cart);
        this.total = t[1];
        return t[0];
    };

    renderCart = () => {
        return renderCart(this.state.cart, this.props.classes, this)
    };

    getBillData = () => {
        return getBillData(this.state.cart)
    };
    scontrino = <Typography variant='title'>Getting order Number...</Typography>;
    ordnum = -1;

    static generateRandom(bits) {
        let vocali = "aeiou";
        let consonanti = "bcdfghjklmnpqrstvyz";
        let isAVocale = true;
        let ret = "";
        for (let i = 0; i < bits; i++) {
            let myarray = isAVocale ? vocali : consonanti;
            ret += myarray[Math.floor(Math.random() * myarray.length)];
            isAVocale = !isAVocale
        }
        return ret;
    }

    reloadList() {
        this.images = [];
        GET(apiCalls.productList).then(res =>
            Object.keys(res.list).forEach(e => {
                this.images.push({title: e, url: res.list[e].bg, prods: res.list[e].elements, width: CategoryWidth});
                this.setState({ordernum: Cassa.generateRandom(11)})
            }));
    }

    componentDidMount() {
        this.reloadList();

        let that = this;

        this.ip = JSON.parse(GETSync(apiCalls.ip)).ip;
    };

    getPlugins(){
        let ret = {};
        let md = require('./configs/modules');
        md.modules.cassa.additional.forEach(e => {
            let {getdata} = require(`${md.modules[e].modulePath}`);
            ret[e] = getdata();
        })
        return ret;
    }

    genScontrino() {
        POST(apiCalls.getOrdNum, {
            user: window.ctx.get("username"),
            token: window.ctx.get("token")
        }).then(res => {
            if (res.state) {
                res = res.ordnum.pad(orderCifres);
                this.ordnum = res;
                this.scontrino =
                    <Scontrino
                        path={scontrinoModel}
                        elementi={this.getBillData()}
                        kw={{
                            totale: this.state.usabuono ? this.state.faketotal : this.getTotal(),
                            pagato: parseFloat(this.state.payed).toFixed(2),
                            resto: (-Math.floor(((this.total[0] + this.total[1] / 100) - parseFloat(this.state.payed)) * 100) / 100).toFixed(2),
                            qrdata: JSON.stringify({
                                num: this.state.ordernum,
                                time: Math.floor(Date.now() / 1000),
                                plugin: this.getPlugins()
                            }),
                            buono: this.state.usabuono ? `BUONO ${this.state.buonoDesc}` : " ",
                            ordnum: res
                        }}
                    />;
                this.forceUpdate()
            }
        });
    }

    render() {

        let tabSpace = 1;
        for (let key of Object.keys(ProductsWidth)) {
            if (window.innerWidth <= parseInt(key)) {
                tabSpace = ProductsWidth[key];
                break;
            }
        }

        return (
            <div className={this.props.classes.root}>
                <NavBar titleText='Cassa' history={this.props.history} showHome={true}
                        detailsText={this.state.ordernum}/>

                {this.state.currentState === this.status.category &&
                <Paper className={this.props.classes.marginTop}>
                    <div>
                        {this.images.map(image => (
                            <ImageButton onClick={() => this.setState({
                                currentState: this.status.product,
                                currentList: image.prods
                            })} image={image}/>
                        ))}
                        <ImageButton onClick={() => {
                            this.setState({
                                currentState: this.status.product,
                                currentList: this.images.map(im => im.prods).flat()
                            });
                        }
                        } image={{title: "Full List", url: "", width: "25%"}}/>
                    </div>
                </Paper>}

                {this.state.currentState === this.status.product &&
                <Paper className={this.props.classes.marginTopNoX}>
                    <Grid container spacing={24}>
                        <Grid item xs={12}>
                            <Paper className={this.props.classes.paperTitle}>
                                <Grid container spacing={24}>
                                    <Grid item xs={2}>
                                        <Button
                                            onClick={() => this.setState({currentState: this.status.category})}>Indietro</Button>
                                    </Grid>
                                    <Grid item xs={8}>
                                        <Typography noWrap variant='title'>Prodotti Disponibili</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid> {/*title*/}
                        {this.state.currentList.map(e => {
                            if (typeof(e.qta) === 'undefined') e.qta = 0;
                            return (<ProductTile tabspace={tabSpace} dispon={e.dispon} desc={e.desc} eur={e.eur}
                                                 cents={e.cents} info={e.info}
                                                 qta={e.qta} details={e.details}
                                                 onClick={() => {
                                                     if (!e.details.display) {
                                                         e.qta += 1;
                                                         this.state.cart.push(e);
                                                         this.forceUpdate()
                                                     } else {
                                                         this.setState({
                                                             currentDetail: e.details,
                                                             isAddOpen: true,
                                                             lastEdited: e
                                                         });
                                                     }
                                                 }}
                                                 onDetailsClick={(evt) => {
                                                     evt.stopPropagation();
                                                     this.setState({
                                                         currentDetail: e.details,
                                                         isAddOpen: true,
                                                         lastEdited: e
                                                     });
                                                 }}/>
                            )
                        })}
                    </Grid>
                </Paper>}

                {this.state.currentState === this.status.review &&
                <Paper className={this.props.classes.marginTopNoX}>
                    <Grid container spacing={12}>
                        <Grid item xs={12} md={9}>
                            {this.renderCart()}
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Eventuali annotazioni"
                                multiline
                                rowsMax="6"
                                value={this.state.note}
                                onChange={(evt) => this.setState({note: evt.target.value})}
                                className={this.props.classes.textField}
                                margin="normal"
                                variant="outlined"
                            />
                            <Typography variant="title">Totale: {this.getTotal()} {Currency}</Typography>
                            {window.ctx.get("isLogged") && <TextField
                                label="Pagato"
                                rowsMax="6"
                                value={this.state.payed}
                                onChange={(evt) => this.setState({payed: evt.target.value})}
                                className={this.props.classes.textField}
                                margin="normal"
                                variant="outlined"
                            />}
                            {window.ctx.get("isLogged") && <Typography
                                variant="title">Resto: {-Math.floor(((this.total[0] + this.total[1] / 100) - parseFloat(this.state.payed)) * 100) / 100} {Currency}</Typography>}
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.state.isAsporto}
                                        onChange={(evt) => this.setState({isAsporto: evt.target.checked})}
                                        value="asporto"
                                    />
                                }
                                label="Ordine d'asporto"
                            />
                            {this.getCartLenght() > 0 && <Button variant="extendedFab" color='green' aria-label="Delete"
                                                                 className={this.props.classes.button} onClick={() => {
                                if (window.ctx.get("isLogged")) this.genScontrino();
                                this.setState({
                                    step: 2,
                                    currentState: this.status.code,
                                    ordernum: Cassa.generateRandom(11),
                                    started: false
                                });
                            }}>
                                <SendIcon className={this.props.classes.extendedIcon}/>
                                Invia
                            </Button>}
                        </Grid>
                    </Grid>
                </Paper>}

                {this.state.currentState === this.status.code &&
                <Paper className={this.props.classes.marginTopNoX}>
                    {(!window.ctx.get("isLogged") && cfg.react.cassa_guest) && (function (th) {
                        if (!th.state.started) {
                            let client = mqtt.connect(mqttServer);
                            let that = this;
                            client.on('connect', () => {
                                // noinspection JSPotentiallyInvalidUsageOfClassThis
                                client.publish(cfg.mqtt["order-guest"], JSON.stringify(
                                    {
                                        cart: th.getCarts(),
                                        orderID: th.state.ordernum,
                                        asporto: th.state.isAsporto,
                                        message: th.state.note,
                                        ip: th.ip,
                                        time: Math.floor(Date.now() / 1000)
                                    }));
                                client.end();
                            });


                            th.state.started = true;
                            th.state.time = Math.floor(Date.now() / 1000);

                            th.state.mins = Math.floor(cfg.guest.timeout / 60);
                            th.state.secs = cfg.guest.timeout - th.state.mins * 60;

                            clearInterval(th.counterFnc);
                            th.counterFnc = setInterval(function () {
                                if (th.state.mins === 0 && th.state.secs === 0) {
                                    th.props.history.push("/");
                                    return;
                                }

                                if (th.state.secs === 0) {
                                    th.state.mins--;
                                    th.state.secs = 59;
                                    th.forceUpdate();
                                    return;
                                }

                                th.state.secs--;
                                th.forceUpdate();

                            }, 1000);
                        }

                        // noinspection JSPotentiallyInvalidUsageOfClassThis
                        return <Grid container justify="center" alignItems="center">
                            <Grid item xs={12}>
                                <QRCode
                                    value={JSON.stringify(
                                        {
                                            orderID: th.state.ordernum,
                                            ip: th.ip,
                                            time: th.state.time
                                        }
                                    )}
                                    style={{padding: 50, backgroundColor: "#FFF"}}
                                    className={th.props.classes.centred}/>
                            </Grid>
                            <Grid item xs={12} className={th.props.classes.centred}>
                                <Typography variant={"subheading"}>Svelto! Mancano solo pochi minuti alla
                                    scadenza!</Typography>
                            </Grid>
                            <Grid item xs={12} className={th.props.classes.centred}>
                                <Typography
                                    variant={"display2"}>{("0" + th.state.mins).substr(-2)}:{("0" + th.state.secs).substr(-2)}</Typography>
                            </Grid>
                            <Grid item xs={12} className={th.props.classes.centred}>
                                <Typography>ID: {th.state.ordernum}</Typography>
                            </Grid>
                        </Grid>
                    }(this))}
                    {window.ctx.get("isLogged") &&
                    <Grid container spacing={24} className={this.props.classes.full}>
                        <Grid item xs={12} md={8}>
                            {this.scontrino}

                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Button className={this.props.classes.bigb} fullWidth variant="contained" color="primary"
                                    onClick={() => {

                                        let client = mqtt.connect(mqttServer);
                                        client.on('connect', () => {
                                            client.publish(cfg.mqtt["order-official"], JSON.stringify(
                                                {
                                                    cart: this.getCarts(),
                                                    orderID: this.state.ordernum,
                                                    asporto: this.state.isAsporto,
                                                    message: this.state.note,
                                                    ip: this.ip,
                                                    user: window.ctx.get("username"),
                                                    buono: this.state.usabuono,
                                                    buonoID: this.state.buonoId,
                                                    time: Math.floor(Date.now() / 1000),
                                                    ordnum: this.ordnum,
                                                    totale: this.total
                                                }));
                                            client.end();
                                        });

                                        document.getElementById("tobeprinted").postMessage({type: 'print'});
                                    }}>stampa</Button>
                            <Button className={this.props.classes.bigb} fullWidth variant="contained" color="secondary"
                                    onClick={() => {
                                        this.reloadList();
                                        this.setState({cart: [], currentState: this.status.category, step: 0})
                                    }}>NUOVO ORDINE</Button>
                            <Button className={this.props.classes.bigb} fullWidth variant="contained" color="secondary"
                                    onClick={() => {
                                        this.setState({buonoOpen: true})
                                    }}>Usa un buono</Button>
                        </Grid>

                    </Grid>}

                </Paper>}

                <Grid container spacing={0} alignContent='justify' alignItems='center'
                      className={this.props.classes.step}>
                    <Grid item xs={10}>
                        <Stepper nonLinear activeStep={this.state.step}>
                            <Step key={0}>
                                <StepButton onClick={() => {
                                    this.setState({step: 0, currentState: this.status.category})
                                }}>Seleziona i prodotti</StepButton>
                            </Step>
                            <Step key={1}>
                                <StepButton onClick={() => {
                                    this.setState({step: 1, currentState: this.status.review})
                                }}>Rivedi l'ordine</StepButton>
                            </Step>
                            {window.ctx.get("isLogged") ?
                                <Step key={2}>
                                    <StepButton onClick={() => {
                                        this.setState({step: 2, currentState: this.status.code});
                                        this.genScontrino()
                                    }}>Completa l'ordine</StepButton>
                                </Step>
                                :
                                <Step key={2}>
                                    <StepButton>Vai alla cassa, paga e mangia!</StepButton>
                                </Step>
                            }
                        </Stepper>
                    </Grid>
                    <Grid item xs={2}>
                        <Paper className={this.props.classes.cartabtn}>
                            <IconButton aria-label="Cart"
                                        onClick={() => this.setState({step: 1, currentState: this.status.review})}>
                                <Badge badgeContent={this.getCartLenght()} color="primary"
                                       classes={{badge: this.props.classes.badge}}>
                                    <CartIcon/>
                                </Badge>
                            </IconButton>
                        </Paper>
                    </Grid>
                </Grid>
                <Dialog open={this.state.isAddOpen}
                        aria-labelledby="simple-dialog-title">
                    <DialogTitle id="simple-dialog-title"><Typography
                        variant='title'>{this.state.currentDetail.title}</Typography></DialogTitle>
                    <DialogContent>
                        <div>
                            {this.state.currentDetail.display && Object.keys(this.state.currentDetail.dialog).map(e => {
                                let everything = [];
                                let first = true;
                                if (e === 'choose') {
                                    everything.push(<RadioGroup
                                        aria-label=""
                                        value={this.state.selectSelected}
                                        onChange={evt => {
                                            this.setState({selectSelected: evt.target.value});
                                        }}
                                    >
                                        {this.state.currentDetail.dialog[e].map(ee => <FormControlLabel value={ee}
                                                                                                        control={
                                                                                                            <Radio/>}
                                                                                                        label={ee}/>)}
                                    </RadioGroup>);
                                } else if (e === 'select') {
                                    everything.push(<div>
                                        {this.state.currentDetail.dialog[e].map((ee, i) => {
                                            let len = i;

                                            return (<FormControlLabel
                                                control={<Checkbox
                                                    checked={this.state.dialogState[len]}
                                                    onChange={(evt) => {
                                                        this.state.dialogState[len] = evt.target.checked;
                                                        this.forceUpdate();
                                                        console.log(this.state.dialogState)
                                                    }}
                                                    value={ee}
                                                />} label={ee}/>)
                                        })}</div>);
                                }

                                return everything;
                            })}
                            <Button
                                onClick={() => this.setState({quantity: (this.state.quantity) < 2 ? 1 : this.state.quantity - 1})}><MinusIcon/></Button>
                            <TextField
                                id="date"
                                label="Quantitá"
                                type="number"
                                value={this.state.quantity}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <Button
                                onClick={() => this.setState({quantity: this.state.quantity + 1})}><AddIcon/></Button>

                            <Button variant="contained" color="primary" onClick={() => {

                                this.state.lastEdited.variant = {
                                    choose: this.state.selectSelected,
                                    select: {
                                        values: this.state.dialogState,
                                        labels: this.state.currentDetail.dialog.select
                                    }
                                };
                                let oldq = this.state.lastEdited.qta;
                                this.state.lastEdited.qta = this.state.quantity;
                                this.state.cart.push(JSON.parse(JSON.stringify(this.state.lastEdited)));
                                this.state.lastEdited.variant = undefined;

                                console.log(this.state.cart);
                                this.state.dialogState = [];
                                this.state.selectSelected = null;

                                this.state.lastEdited.qta = oldq + this.state.quantity;
                                this.setState({isAddOpen: false, quantity: 1,});
                            }}>Aggiungi</Button>
                        </div>
                    </DialogContent>
                </Dialog>
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
                                    if (this.total[0] + this.total[1] / 100 < res.minimo) {
                                        alert(`Minimo non rispettato: spesa minima di ${res.minimo} EUR`);
                                    } else {
                                        if (res.tipo === 1) {
                                            this.state.faketotal = "0.00";
                                            this.state.buonoDesc = (-this.total[0] + this.total[1] / 100).toFixed(2) + Currency
                                        }
                                        else if (res.tipo === 2) {
                                            this.state.faketotal = (this.total[0] + this.total[1] / 100 - res.valore).toFixed(2);
                                            this.state.buonoDesc = (-res.valore).toFixed(2) + Currency
                                        }
                                        else if (res.tipo === 3) {
                                            this.state.faketotal = (this.total[0] + this.total[1] / 100 - res.valore * (this.total[0] + this.total[1] / 100) / 100).toFixed(2);
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
            </div>
        );
    }

    getCarts() {
        return getCarts(this.state.cart)
    }
}

let classe = withStyles(styles)(Cassa);
export {classe}
export default withStyles(styles)(Cassa);