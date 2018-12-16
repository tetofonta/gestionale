import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import Paper from "@material-ui/core/es/Paper/Paper";
import SaveIcon from '@material-ui/icons/Save';
import Scontrino from "./components/Scontrino";
import Grid from "@material-ui/core/es/Grid/Grid";
import Button from "@material-ui/core/es/Button/Button";
import TextField from "@material-ui/core/es/TextField/TextField";
import AddIcon from "@material-ui/icons/Add"
import PrintIcon from "@material-ui/icons/Print"
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import {POST} from "./network";
import {apiCalls} from "./consts";
import Typography from "@material-ui/core/es/Typography/Typography";
import Checkbox from "@material-ui/core/es/Checkbox/Checkbox";


const styles = theme => ({
    marginTop: {
        marginTop: 64,
        paddingTop: 30,
        height: "calc(100vh - 66px - 30px)",
        width: "99.5%",
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
    foo: {}
});

class Buoni extends React.Component {

    state = {
        list: []
    };
    update = null;

    componentDidMount() {
        POST(apiCalls.buoni, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                this.setState({list: res.list});
                this.state.list.forEach(e => {
                    if (e.tipo === 1) e.valore = null;
                    e.usato = e.usato !== 0;
                    e.edited = false;
                });
                this.forceUpdate();
            } else console.log(res)
        })
    }

    getRandomId() {
        let base = 10000;
        let maxr = 89999;
        let rnd = 42;
        let ok = true;
        while (ok) {
            rnd = base + Math.floor(Math.random() * maxr);
            for (let i = 0; i < this.state.list.length; i++) {
                if (rnd === this.state.list[i].id) break;
                if (rnd < this.state.list[i].id) {
                    ok = false;
                    break;
                }
            }
        }
        return rnd;
    }

    render() {
        return (
            <div>
                <NavBar titleText='Gestione Buoni' history={this.props.history} showHome={true}/>

                <Paper className={this.props.classes.marginTop}>
                    <Grid container spacing={24}>
                        <Grid xs={1}/>
                        <Grid xs={10}>
                            <Grid container spacing={24}>
                                <Grid xs={1}/>
                                <Grid xs={10}>
                                    <Grid container spacing={8} alignContent='center' alignItems='center'>
                                        {/*<Hidden mdDown>*/}
                                        {/*<Grid item xs={2}/>*/}
                                        {/*</Hidden>*/}
                                        <Grid item xs={12}>
                                            <Grid container spacing={8}>
                                                <Grid item xs={3}><Typography variant='title'>ID
                                                    BUONO</Typography></Grid>
                                                <Grid item xs={2}><Typography
                                                    variant='title'>Tipologia</Typography></Grid>
                                                <Grid item xs={2}><Typography variant='title'>Valore</Typography></Grid>
                                                <Grid item xs={2}><Typography variant='title'>Minimo spesa</Typography></Grid>
                                                <Grid item xs={2}><Typography variant='title'>Usato</Typography></Grid>
                                                <Grid item xs={1}><Button onClick={() => {
                                                    // noinspection JSIgnoredPromiseFromCall
                                                    POST(apiCalls.updbuoni, {
                                                        user: window.ctx.get("username"),
                                                        token: window.ctx.get("token"),
                                                        modified: this.state.list.filter(e => e.edited)
                                                    })
                                                }}><SaveIcon/></Button></Grid>

                                                <Grid item xs={3}/>
                                                <Grid item xs={2}>
                                                    <TextField onChange={e => {
                                                        this.state.tipo = parseInt(e.target.value);
                                                        this.forceUpdate()
                                                    }}/>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <TextField onChange={e => {
                                                        this.state.valore = parseInt(e.target.value);
                                                        this.forceUpdate()
                                                    }}/>
                                                </Grid>
                                                <Grid item xs={2}><TextField onChange={e => {
                                                    this.state.minimo = parseInt(e.target.value);
                                                    this.forceUpdate()
                                                }}/></Grid>
                                                <Grid item xs={2}/>
                                                <Grid item xs={1}>
                                                    <Button onClick={() => {
                                                        if (!isNaN(this.state.tipo) && !isNaN(this.state.valore) && !isNaN(this.state.minimo))
                                                            this.state.list.push({
                                                                id: this.getRandomId(),
                                                                tipo: this.state.tipo,
                                                                valore: this.state.valore,
                                                                minimo: this.state.minimo,
                                                                usato: false,
                                                                edited: true
                                                            });
                                                        this.forceUpdate()
                                                    }}><AddIcon/></Button>
                                                </Grid>

                                                {this.state.list.map((e, i) => {
                                                    let infos =
                                                        <Grid container>
                                                            <Grid item xs={3}><Typography
                                                                variant='subtitle'>{e.id}</Typography></Grid>
                                                            <Grid item xs={2}>
                                                                <TextField placeholder={e.tipo} onChange={e => {
                                                                    this.state.list[i].tipo = parseInt(e.target.value);
                                                                    this.state.list[i].edited = true;
                                                                    if (this.update !== null) clearTimeout(this.update);
                                                                    this.update = setTimeout(() => this.forceUpdate(), 1000)
                                                                }}/>
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                {e.tipo !== 1 &&
                                                                <TextField placeholder={e.valore} onChange={e => {
                                                                    this.state.list[i].valore = parseInt(e.target.value);
                                                                    this.state.list[i].edited = true;

                                                                    if (this.update !== null) clearTimeout(this.update);
                                                                    this.update = setTimeout(() => this.forceUpdate(), 1000)
                                                                }}/>}
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                <TextField placeholder={e.minimo} onChange={e => {
                                                                    this.state.list[i].minimo = parseInt(e.target.value);
                                                                    this.state.list[i].edited = true;

                                                                    if (this.update !== null) clearTimeout(this.update);
                                                                    this.update = setTimeout(() => this.forceUpdate(), 1000)
                                                                }}/>
                                                            </Grid>
                                                            <Grid item xs={2}>
                                                                <Checkbox
                                                                    checked={e.usato}
                                                                    onChange={(e) => {
                                                                        this.state.list[i].usato = e.target.checked;
                                                                        this.state.list[i].edited = true;
                                                                        this.forceUpdate()
                                                                    }}
                                                                    value=""
                                                                    color="primary"
                                                                />
                                                            </Grid>
                                                            <Grid item xs={1}>
                                                                <Button onClick={() => {
                                                                    this.setState({
                                                                        desc: (e.tipo !== 1 ? "" + e.valore : "SERVIZIO GRATUITO") + " " + (e.tipo === 1 ? "" : (e.tipo === 2 ? "EUR" : "%")),
                                                                        imp: e.tipo === 1 ? "" : e.valore + "",
                                                                        min: e.minimo,
                                                                        open: true
                                                                    })
                                                                }}>
                                                                    <PrintIcon/>
                                                                </Button>
                                                            </Grid>
                                                        </Grid>;
                                                    return <Grid item xs={12}
                                                                 className={i % 2 ? this.props.classes.even : this.props.classes.foo}>
                                                        {e.edited &&
                                                        <Paper
                                                            className={i % 2 ? this.props.classes.even : this.props.classes.foo}>
                                                            {infos}
                                                        </Paper>}
                                                        {!e.edited && <div>{infos}</div>}
                                                    </Grid>
                                                })}

                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid xs={1}/>
                            </Grid>
                        </Grid>
                        <Grid xs={1}/>
                    </Grid>
                </Paper>

                {this.state.open && <Dialog
                    open={this.state.open}
                    onClose={() => this.setState({open: false})}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Anteprima</DialogTitle>
                    <DialogContent>
                        <Scontrino elementi={[]} path='/TEMPLATES/buono.json' kw={{
                            ordnum: 0,
                            descrizione: this.state.desc,
                            importo: this.state.imp,
                            minimo: this.state.min,
                            emesso: Date.now()
                        }}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({open: false})} color="primary">
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>}
            </div>)
            ;
    }
}
let classe = withStyles(styles)(Buoni);
export {classe}
export default withStyles(styles)(Buoni)