import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import {POST} from "./network";
import {apiCalls} from "./consts";
import Paper from "@material-ui/core/es/Paper/Paper";
import Grid from "@material-ui/core/es/Grid/Grid";
import List from "@material-ui/core/es/List/List";
import ListItem from "@material-ui/core/es/ListItem/ListItem";
import ListItemIcon from "@material-ui/core/es/ListItemIcon/ListItemIcon";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";
import Collapse from "@material-ui/core/es/Collapse/Collapse";
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CategoryIcon from '@material-ui/icons/Category';
import StatsIcon from '@material-ui/icons/BarChart';
import Graph from 'react-chartjs2'
import Typography from "@material-ui/core/es/Typography/Typography";
import IconButton from "@material-ui/core/es/IconButton/IconButton";
import CalendarIcon from "@material-ui/icons/CalendarToday";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import Button from "@material-ui/core/es/Button/Button";
import TextField from "@material-ui/core/es/TextField/TextField";
import XLSX from "xlsx"

const styles = theme => ({
    marginTop: {
        marginTop: 64,
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
    foo: {},
    appBar: {
        top: 'auto',
        bottom: 0,
    },
    toolbar: {
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

function flip(arr, total) {
    let ret = [];
    for (let i = 0; i < arr[0].length; i++)
        ret.push(arr.map(q => q[i]));

    let tot = ret.map(e => e[total]).reduce(function (a, b) {
        return a + b;
    }, 0);
    let foo = [];
    foo[total] = tot;
    ret.push([]);
    ret.push(foo);
    return ret;
}

class Stats extends React.Component {

    state = {
        data: {},
        fromt: 0,
        tot: 99999999999
    };
    devFromT = 0;
    devToT = 0;

    static getDate() {
        let date = new Date();
        console.log(`${date.getFullYear()}-${date.getMonth()}-${date.getDay()}T${date.getHours()}:${date.getMinutes()}`);
        return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).substr(-2)}-${("0" + date.getDate()).substr(-2)}T${("0" + date.getHours()).substr(-2)}:${("0" + date.getMinutes()).substr(-2)}`
    }

    updateList() {
        this.state.data = {};
        POST(apiCalls.getStats, {
            user: window.ctx.get("username"),
            token: window.ctx.get("token"),
            fromTime: this.state.fromt,
            toTime: this.state.tot
        }).then(res => {
            if (res.state) {
                res.obj.forEach(e => {
                    if (!this.state.data[e.group]) this.state.data[e.group] = [];
                    this.state.data[e.group].push(e);
                    this.state.data[e.group].opened = false;
                });
                this.forceUpdate();
            } else console.log(res)
        })
    }

    componentDidMount() {
        this.updateList()
    }

    render() {
        return (
            <div>
                <NavBar titleText='Statistiche' history={this.props.history} showHome={true} elements={[
                    <IconButton
                        onClick={() => this.setState({openChooser: true})}
                        color="inherit"
                    >
                        <CalendarIcon/>
                    </IconButton>,
                    <IconButton
                        onClick={() => {
                            let filename = "report.xlsx";
                            let wb = XLSX.utils.book_new();
                            let data, ws;
                            Object.keys(this.state.data).map(q => {
                                this.state.data[q].map(e => {
                                    let ws_name;
                                    switch (e.type) {
                                        case "bar":
                                            data = [[e.name], ...flip([e.query.map(e => e.label), e.query.map(e => e.y)], 1)];
                                            break;
                                        case "comparation":
                                            data = [[e.name], ...flip([Object.keys(e.query[0]), Object.keys(e.query[0]).map(q => e.query[0][q])], 1)];
                                            break;
                                        case "value":
                                            data = [[e.name, e.query[0].value, e.measure]];
                                            break;
                                        case "line":
                                            let series = [];
                                            e.query.forEach(q => {
                                                if (!series.includes(q[e.series])) series.push(q[e.series]);
                                            });

                                            let labels = {};
                                            e.query.forEach(q => {
                                                if (!labels[q.label]) labels[q.label] = {};
                                                series.forEach(w => labels[q.label][w] = 0)
                                            });

                                            e.query.forEach(q => {
                                                labels[q.label][q[e.series]] = q.y
                                            });

                                            data = flip([series, ...series.map(e => Object.keys(labels).map(q => labels[q][e]))], series.length - 1);
                                            break;
                                        default:
                                            return;
                                    }
                                    ws_name = (Math.random().toString(36).substr(2) + e.name).substr(0, 20);
                                    ws = XLSX.utils.aoa_to_sheet(data);
                                    XLSX.utils.book_append_sheet(wb, ws, ws_name);
                                })
                            });
                            XLSX.writeFile(wb, filename);
                        }}
                        color="inherit"
                    >
                        <DownloadIcon/>
                    </IconButton>
                ]}/>
                <Paper className={this.props.classes.marginTop}>
                    <Grid container spacing={0}>
                        <Grid item xs={12} lg={3}>
                            <Paper className={this.props.classes.container}>
                                <List>
                                    {Object.keys(this.state.data).map(e => {
                                        return [
                                            <ListItem button onClick={() => {
                                                this.state.data[e].opened = !this.state.data[e].opened;
                                                this.forceUpdate()
                                            }}>
                                                <ListItemIcon>
                                                    <CategoryIcon/>
                                                </ListItemIcon>
                                                <ListItemText inset primary={e}/>
                                                {this.state.data[e].opened ? <ExpandLess/> : <ExpandMore/>}
                                            </ListItem>,
                                            <Collapse in={this.state.data[e].opened} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {this.state.data[e].map(q => {
                                                        return <ListItem button onClick={() => {
                                                            console.log(q);
                                                            this.setState({
                                                                open: true,
                                                                graph: q
                                                            })
                                                        }}>
                                                            <ListItemIcon>
                                                                <StatsIcon/>
                                                            </ListItemIcon>
                                                            <ListItemText inset primary={q.name}/>
                                                        </ListItem>
                                                    })}
                                                </List>
                                            </Collapse>]
                                    })}
                                </List>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} lg={9}>
                            {this.state.open && <Typography variant="title">{this.state.graph.name}</Typography>}
                            {this.state.open && this.state.graph.type === "bar" &&
                            <Graph data={{
                                labels: this.state.graph.query.map(e => e.label),
                                datasets: [
                                    {
                                        label: this.state.graph.name,
                                        fillColor: "rgba(220,220,220,0.5)",
                                        strokeColor: "rgba(220,220,220,0.8)",
                                        highlightFill: "rgba(220,220,220,0.75)",
                                        highlightStroke: "rgba(220,220,220,1)",
                                        data: this.state.graph.query.map(e => e.y)
                                    }
                                ]
                            }} type="bar"/>}
                            {this.state.open && this.state.graph.type === "line" &&
                            (function (that) {

                                let series = [];
                                that.state.graph.query.forEach(e => {
                                    if (!series.includes(e[that.state.graph.series])) series.push(e[that.state.graph.series]);
                                });

                                let labels = {};
                                that.state.graph.query.forEach(e => {
                                    if (!labels[e.label]) labels[e.label] = {};
                                    series.forEach(q => labels[e.label][q] = 0)
                                });

                                that.state.graph.query.forEach(e => {
                                    labels[e.label][e[that.state.graph.series]] = e.y
                                });

                                return <Graph data={{
                                    labels: Object.keys(labels),
                                    datasets: series.map(e => {
                                            return {
                                                label: e,
                                                data: Object.keys(labels).map(q => labels[q][e])
                                            }
                                        }
                                    )
                                }} type="line"/>
                            })(this)}
                            {this.state.open && this.state.graph.type === "value" &&
                            <Typography
                                variant={"display4"}>{this.state.graph.query[0].value} {this.state.graph.measure}</Typography>}
                            {this.state.open && this.state.graph.type === "comparation" &&
                            <Graph data={{
                                labels: Object.keys(this.state.graph.query[0]),
                                datasets: [{data: Object.keys(this.state.graph.query[0]).map(e => this.state.graph.query[0][e])}]
                            }} type="doughnut"/>}

                        </Grid>
                    </Grid>
                </Paper>

                <Dialog
                    open={this.state.openChooser}
                    onClose={() => this.setState({openChooser: false})}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Seleziona intervallo</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Inizio intervallo"
                            type="datetime-local"
                            defaultValue="2000-01-01T00:00"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={(e) => this.devFromT = e.target.value}
                        />
                        <TextField
                            fullWidth
                            label="Fine intervallo"
                            type="datetime-local"
                            defaultValue={Stats.getDate()}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            onChange={(e) => this.devToT = e.target.value}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({openChooser: false})} color="secondary">
                            Annulla
                        </Button>
                        <Button onClick={() => {
                            this.state.openChooser = false;
                            this.state.fromt = new Date(this.devFromT).getTime() / 1000;
                            this.state.tot = new Date(this.devToT).getTime() / 1000;
                            this.updateList();
                        }} color="primary">
                            Conferma
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>)
            ;
    }
}

let classe = withStyles(styles)(Stats);
export {classe}
export default withStyles(styles)(Stats)