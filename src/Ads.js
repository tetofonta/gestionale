import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import {POST} from "./network";
import Paper from "@material-ui/core/es/Paper/Paper";
import Table from "@material-ui/core/es/Table/Table";
import TableHead from "@material-ui/core/es/TableHead/TableHead";
import TableRow from "@material-ui/core/es/TableRow/TableRow";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableBody from "@material-ui/core/es/TableBody/TableBody";
import {apiCalls} from "./consts";
import Button from "@material-ui/core/es/Button/Button";
import DeleteIcon from "@material-ui/icons/Remove"
import AddIcon from "@material-ui/icons/Add"
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import ShowIcon from '@material-ui/icons/Watch';
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import Grid from "@material-ui/core/es/Grid/Grid";
import TextField from "@material-ui/core/es/TextField/TextField";


const styles = theme => ({
    marginTop: {
        marginTop: 68,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        zIndex: -2
    },
    table: {
        minWidth: 700,
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
    nomarginANDwidth: {
        width: 128,
    },
    vertical: {
        overflow: 'hidden',
        height: '30vh',
        margin: 'auto',
    },
    horizontal: {
        overflow: 'hidden',
        width: '5vw',
        margin: 'auto',
    }
});

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: '#333',
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

class Ads extends React.Component {

    state = {};
    update = null;

    componentDidMount() {
        const {classes} = this.props;
        POST(apiCalls.getAds, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                this.setState({data: res.ret});
            } else console.log(res)
            console.log(res)
        });
    }

    componentWillUnmount() {

    }

    render() {
        const ad = (rep, con, cls) => <img src={con.replace("%", rep)} className={cls}/>;
        const {classes} = this.props;
        return (
            <div>
                <NavBar titleText='Gestione Pubblicitá' history={this.props.history} showHome={true}/>
                <Paper className={this.props.classes.marginTop}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <CustomTableCell>Nome</CustomTableCell>
                                <CustomTableCell>Rango</CustomTableCell>
                                <CustomTableCell className={classes.nomarginANDwidth}>Immagine</CustomTableCell>
                                {!this.state.edit &&
                                <CustomTableCell padding={"dense"} className={classes.nomarginANDwidth}><Button
                                    onClick={() => this.setState({edit: true})}><EditIcon/></Button></CustomTableCell>}
                                {this.state.edit && <CustomTableCell padding={"dense"}
                                                                     className={classes.nomarginANDwidth}><Button
                                    onClick={() => {
                                        POST(apiCalls.editAds, {
                                            user: window.ctx.get("username"),
                                            token: window.ctx.get("token"),
                                            edited: this.state.data.filter(e => e.edited).map(e => {
                                                e.edited = false;
                                                e.new = false;
                                                this.forceUpdate();
                                                return e
                                            })
                                        });
                                        this.setState({edit: false})
                                    }}><SaveIcon/></Button><Button
                                    onClick={() => {
                                        this.state.data.push({
                                            desc: "Nuovo",
                                            rank: 1,
                                            image_src: "",
                                            edited: true,
                                            new: true
                                        });
                                        this.forceUpdate()
                                    }}><AddIcon/></Button></CustomTableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.state.data && this.state.data.map((e, i) => <TableRow className={classes.row}>
                                <CustomTableCell>{this.state.edit ? <TextField placeholder={e.desc} onChange={(evt) => {
                                    e.desc = evt.target.value;
                                    e.edited = true;
                                    if (this.update !== null)
                                        clearTimeout(this.update);
                                    this.update = setTimeout(() => this.forceUpdate(), 1000);
                                }}/> : e.desc}</CustomTableCell>
                                <CustomTableCell>{this.state.edit &&
                                <div><Button variant={"contained"} color={"primary"} onClick={() => {
                                    e.rank++;
                                    e.edited = true;
                                    this.forceUpdate();
                                }}><AddIcon/></Button><Button variant={"contained"} color={"secondary"} onClick={() => {
                                    e.rank > 1 ? e.rank-- : e.rank = 1;
                                    e.edited = true;
                                    this.forceUpdate()
                                }}><DeleteIcon/></Button></div>} {e.rank}</CustomTableCell>
                                <CustomTableCell className={classes.nomarginANDwidth}>{this.state.edit ?
                                    <TextField placeholder={e.image_src} onChange={(evt) => {
                                        e.image_src = evt.target.value;
                                        e.edited = true;
                                        if (this.update !== null)
                                            clearTimeout(this.update);
                                        this.update = setTimeout(() => this.forceUpdate(), 1000);
                                    }}/> : <Button
                                        onClick={() => this.setState({
                                            show: true,
                                            element: e
                                        })}><ShowIcon/></Button>}</CustomTableCell>
                                <CustomTableCell padding={"dense"}
                                                 className={classes.nomarginANDwidth}>{this.state.edit &&
                                <Button onClick={() => {
                                    if (!e.new) POST(apiCalls.delAds, {
                                        user: window.ctx.get("username"),
                                        token: window.ctx.get("token"),
                                        id: e.id
                                    });
                                    this.state.data.splice(i, 1);
                                    this.forceUpdate()
                                }}><DeleteIcon/></Button>}{e.edited && '*'}</CustomTableCell>
                            </TableRow>)}
                        </TableBody>
                    </Table>
                </Paper>

                {this.state.show &&
                <Dialog open={this.state.show} onClose={() => this.setState({show: false})}>
                    <DialogTitle id="simple-dialog-title">Should be...</DialogTitle>
                    <div>
                        <Grid container>
                            <Grid item xs={6}>
                                {ad("vert_", this.state.element.image_src, classes.vertical)}
                            </Grid>
                            <Grid item xs={6}>
                                {ad("hor_", this.state.element.image_src, classes.vertical)}
                            </Grid>
                        </Grid>
                    </div>
                </Dialog>}
            </div>)
            ;
    }
}

let classe = withStyles(styles)(Ads);
export {classe}
export default withStyles(styles)(Ads)