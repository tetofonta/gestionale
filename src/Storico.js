import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import Paper from "@material-ui/core/es/Paper/Paper";
import List from "@material-ui/core/es/List/List";
import ListItem from "@material-ui/core/es/ListItem/ListItem";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";
import Scontrino from "./components/Scontrino";
import Grid from "@material-ui/core/es/Grid/Grid";
import FormControlLabel from "@material-ui/core/es/FormControlLabel/FormControlLabel";
import ListItemAvatar from "@material-ui/core/es/ListItemAvatar/ListItemAvatar";
import {POST} from "./network";
import {apiCalls, mqttServer, scontrinoModel} from "./consts";
import Typography from "@material-ui/core/es/Typography/Typography";
import Checkbox from "@material-ui/core/es/Checkbox/Checkbox";
import {getBillData, getCarts, renderCart} from "./Cart";
import * as mqtt from "mqtt";
import Button from "@material-ui/core/es/Button/Button";


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
    scr:{
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

class Storico extends React.Component {

    state = {
        list: [],
        ord: {}
    };

    client = null;

    componentDidMount() {
        POST(apiCalls.getStorico, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                this.setState({list: res.list});
                if (Object.keys(this.state.list).length > 0) {
                    // this.setState({ord: this.state.list[Object.keys(this.state.list)[0]], open: true})
                }
            }
        });

        this.client = mqtt.connect(mqttServer);
        this.client.on('connect', () => {
            this.client.subscribe('order/official', (e) => {
                console.log(e)
            })
        });

        let that = this;
        this.client.on('message', function (topic, message) {
            let obj = JSON.parse(message.toString());
            that.state.list[obj.orderID] = {
                cart: obj.cart,
                time: obj.time,
                ordnum: obj.ordnum,
                message: obj.message,
                asporto: obj.asporto !== 0,
                ip: obj.ip,
                totale: obj.totale,
                orderID: obj.orderID,
                user: obj.user,
            };
            that.forceUpdate()
        })
    }

    componentWillUnmount() {
        this.client.end();
    }

    render() {
        return (
            <div>
                <NavBar titleText='Storico ordini' history={this.props.history} showHome={true}/>

                <Paper className={this.props.classes.marginTop}>
                    <Grid container spacing={0}>
                        <Grid item xs={12} lg={3}>
                            <Paper className={this.props.classes.container}>
                                <List>
                                    {Object.keys(this.state.list).reverse().map(e =>
                                        <ListItem button onClick={() => {
                                            this.setState({ord: this.state.list[e], open: true})
                                        }}>
                                            <ListItemAvatar>
                                                <Typography variant='display2'>{this.state.list[e].ordnum}</Typography>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={e.substr(0, 16) + (e.length > 16 ? "..." : "")}
                                                secondary={this.state.list[e].user + " @ " + getDate(this.state.list[e].time)}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} lg={9}>
                            {this.state.open &&
                            <Paper className={this.props.classes.container}>
                                <Grid container spacing={12} alignItems="center" justify="center">
                                    <Grid item xs={12}>
                                        {renderCart(this.state.ord.cart, this.props.classes, this, true, false)}
                                    </Grid>
                                    <Grid item xs={4}>

                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={this.state.sendAgain}
                                                    onChange={(e) => this.setState({sendAgain: e.target.checked})}
                                                />
                                            }
                                            label="Reinvia"
                                        />
                                        <Button onClick={() => {
                                            if (this.state.sendAgain) {
                                                this.client.publish('order/official', JSON.stringify(
                                                    {
                                                        cart: getCarts(this.state.ord.cart, true),
                                                        orderID: this.state.ord.orderID + Date.now(),
                                                        asporto: this.state.ord.asporto,
                                                        message: " " + this.state.ord.message,
                                                        ip: this.state.ord.ip,
                                                        user: "reprint",
                                                        buono: false,
                                                        buonoID: null,
                                                        time: Math.floor(Date.now() / 1000),
                                                        ordnum: this.state.ord.ordnum,
                                                        totale: this.state.ord.totale
                                                    }));
                                                let that = this;
                                                document.getElementById("tobeprinted").postMessage({type: 'print'});
                                            }
                                        }} color="primary">
                                            Stampa
                                        </Button>
                                    </Grid>
                                    <Grid item xs={8} className={this.props.classes.scr}>
                                        <Scontrino
                                            path={scontrinoModel}
                                            elementi={getBillData(this.state.ord.cart, true)}
                                            kw={{
                                                totale: ("0" + this.state.ord.totale[0]).substr(-2) + "." + ("0" + this.state.ord.totale[1]).substr(-2),
                                                pagato: "00.00",
                                                resto: "00.00",
                                                qrdata: JSON.stringify({
                                                    num: this.state.ord.ordnum,
                                                    time: Math.floor(Date.now() / 1000)
                                                }),
                                                buono: "RISTAMPATO",
                                                ordnum: this.state.ord.ordnum
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>}
                        </Grid>
                    </Grid>
                </Paper>

            </div>)
            ;
    }
}

export default withStyles(styles)(Storico)