import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import Paper from "@material-ui/core/es/Paper/Paper";
import Drawer from "@material-ui/core/es/Drawer/Drawer";
import List from "@material-ui/core/es/List/List";
import ListItem from "@material-ui/core/es/ListItem/ListItem";
import ListItemIcon from "@material-ui/core/es/ListItemIcon/ListItemIcon";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";
import TextIcon from '@material-ui/icons/TextFields';
import ImageIcon from '@material-ui/icons/Image';
import CodeIcon from '@material-ui/icons/Code';
import LinkIcon from '@material-ui/icons/Link';
import PreviewIcon from '@material-ui/icons/Slideshow';
import SaveIcon from '@material-ui/icons/Save';
import LineIcon from '@material-ui/icons/LineStyle';
import RectIcon from '@material-ui/icons/CropSquare';
import Divider from "@material-ui/core/es/Divider/Divider";
import Scontrino from "./components/Scontrino";
import Grid from "@material-ui/core/es/Grid/Grid";
import Button from "@material-ui/core/es/Button/Button";
import FullScreenDialog from "./components/FullScreenDialog";
import TextField from "@material-ui/core/es/TextField/TextField";
import AddIcon from "@material-ui/icons/Add"
import PrintIcon from "@material-ui/icons/Print"
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/es/DialogContentText/DialogContentText";
import FormControl from "@material-ui/core/es/FormControl/FormControl";
import InputLabel from "@material-ui/core/es/InputLabel/InputLabel";
import Select from "@material-ui/core/es/Select/Select";
import MenuItem from "@material-ui/core/es/MenuItem/MenuItem";
import * as jsPDF from 'jspdf'
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import FormLabel from "@material-ui/core/es/FormLabel/FormLabel";
import RadioGroup from "@material-ui/core/es/RadioGroup/RadioGroup";
import FormControlLabel from "@material-ui/core/es/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/es/Radio/Radio";
import ListItemAvatar from "@material-ui/core/es/ListItemAvatar/ListItemAvatar";
import Avatar from "@material-ui/core/es/Avatar/Avatar";
import Hidden from "@material-ui/core/es/Hidden/Hidden";
import {POST} from "./network";
import {apiCalls} from "./consts";
import Typography from "@material-ui/core/es/Typography/Typography";
import CheckBox from "@material-ui/core/es/internal/svg-icons/CheckBox";
import Checkbox from "@material-ui/core/es/Checkbox/Checkbox";


const styles = theme => ({
    marginTop: {
        marginTop: 66,
        height: "calc(100vh - 66px)",
        width: "99.5%",
        overflowY: "auto",
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

    componentDidMount() {
        POST(apiCalls.buoni, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                this.setState({list: res.list});
                this.state.list.forEach(e => {
                    if (e.tipo === 1) e.valore = null;
                    e.usato = e.usato === 1;
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
                    <Grid container spacing={8} alignContent='center' alignItems='center'>
                        {/*<Hidden mdDown>*/}
                        {/*<Grid item xs={2}/>*/}
                        {/*</Hidden>*/}
                        <Grid item xs={12}>
                            <Grid container spacing={8}>
                                <Grid item xs={3}><Typography variant='title'>ID BUONO</Typography></Grid>
                                <Grid item xs={2}><Typography variant='title'>Tipologia</Typography></Grid>
                                <Grid item xs={2}><Typography variant='title'>Valore</Typography></Grid>
                                <Grid item xs={2}><Typography variant='title'>Minimo spesa</Typography></Grid>
                                <Grid item xs={2}><Typography variant='title'>Usato</Typography></Grid>
                                <Grid item xs={1}><Button onClick={() => {
                                    POST(apiCalls.updbuoni, {
                                        user: window.ctx.get("username"),
                                        token: window.ctx.get("token"),
                                        modified: this.state.list.filter(e => e.edited)
                                    })
                                }}><SaveIcon/></Button></Grid>

                                <Grid item xs={3}/>
                                <Grid item xs={2}><TextField onChange={e => {
                                    this.state.tipo = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
                                    this.forceUpdate()
                                }}/></Grid>
                                <Grid item xs={2}><TextField onChange={e => {
                                    this.state.valore = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
                                    this.forceUpdate()
                                }}/></Grid>
                                <Grid item xs={2}><TextField onChange={e => {
                                    this.state.minimo = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
                                    this.forceUpdate()
                                }}/></Grid>
                                <Grid item xs={2}/>
                                <Grid item xs={1}><Button onClick={() => {
                                    this.state.list.push({
                                        id: this.getRandomId(),
                                        tipo: this.state.tipo,
                                        valore: this.state.valore,
                                        minimo: this.state.minimo,
                                        usato: false,
                                        edited: true
                                    });
                                    this.forceUpdate()
                                }}><AddIcon/></Button></Grid>

                                {this.state.list.map((e, i) => {
                                    let infos =
                                        <Grid container>
                                            <Grid item xs={3}><Typography
                                                variant='subtitle'>{e.id}</Typography></Grid>
                                            <Grid item xs={2}>
                                                <TextField value={e.tipo} onChange={e => {
                                                    this.state.list[i].tipo = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
                                                    this.state.list[i].edited = true;
                                                    this.forceUpdate()
                                                }}/>
                                            </Grid>
                                            <Grid item xs={2}>
                                                {e.tipo !== 1 && <TextField value={e.valore} onChange={e => {
                                                    this.state.list[i].valore = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
                                                    this.state.list[i].edited = true;
                                                    this.forceUpdate()
                                                }}/>}
                                            </Grid>
                                            <Grid item xs={2}>
                                                <TextField value={e.minimo} onChange={e => {
                                                    this.state.list[i].minimo = isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value);
                                                    this.state.list[i].edited = true;
                                                    this.forceUpdate()
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
                                        <Paper className={i % 2 ? this.props.classes.even : this.props.classes.foo}>
                                            {infos}
                                        </Paper>}
                                        {!e.edited && <div>{infos}</div>}
                                    </Grid>
                                })}

                            </Grid>
                        </Grid>
                    </Grid>
                    {/*<Hidden mdDown>*/}
                    {/*<Grid item xs={2}/>*/}
                    {/*</Hidden>*/}
                </Paper>

                {this.state.open && <Dialog
                    open={this.state.open}
                    onClose={() => this.setState({open: false})}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Anteprima</DialogTitle>
                    <DialogContent>
                        <Scontrino elementi={[]} path='/TEMPLATES/buono.json' kw={{ordnum: 0, descrizione: this.state.desc, importo: this.state.imp, minimo: this.state.min, emesso: Date.now()}}/>
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

export default withStyles(styles)(Buoni)