import React from "react";
import NavBar from './components/NavBar'
import {apiCalls, sagraName} from "./consts";
import Grid from "@material-ui/core/es/Grid/Grid";
import Hidden from "@material-ui/core/es/Hidden/Hidden";
import {withStyles} from '@material-ui/core/styles';
import {GET, POST} from "./network";
import Typography from "@material-ui/core/es/Typography/Typography";
import FunctionTile from "./components/FunctionTile";
import * as cfg from "./configs/network.config"
import * as modules from "./configs/modules"

const styles = theme => ({
    marginTop: {
        marginTop: 64,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden"
    },
    imageV: {
        overflow: 'hidden',
        height: 'calc(100vh - 70px)',
        width: '100%',
        margin: 'auto',
    },
    imageH: {
        overflow: 'hidden',
        width: '100vw',
        margin: 'auto',
    },
    grid: {
        // overflow: 'hidden',
        minHeight: 'calc(100vh - 70px)'
    }
});

class Dashboard extends React.Component {

    state = {
        pub1: "",
        pub2: ""
    };

    ad = (rep, con, cls) => <img src={con.replace("%", rep)} className={cls}/>;

    dashboard = [];

    componentDidMount() {
        if (!window.ctx.get("isLogged"))
            GET(apiCalls.ads).then(res => {
                if (res.state) {
                    this.setState({pub1: res.ads[0], pub2: res.ads[1]})
                } else {
                }
            });

        POST(apiCalls.getFncs, window.ctx.get("isLogged") ? {
            user: window.ctx.get("username"),
            token: window.ctx.get("token")
        } : {guest: true}).then(res => {
            console.log(res);
            if (res.state)
                res.ret.forEach(e => {
                    this.dashboard.push(
                        <Grid container spacing={24}>
                            <Grid item xs={12}>
                                <Typography variant="title"><i className={e.icon}/>{e.category}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                {e.content.map(i => {
                                    console.log(i);
                                    if(! modules.modules[i.modulename]) return;
                                    if(! modules.modules[i.modulename].enabled) return;
                                    return (
                                    <FunctionTile onClick={() => this.props.history.push(i.to)}
                                                  icon={i.icon} title={i.name} descr={i.desc}
                                                  tooltip={i.tooltip}/>)
                                })}
                            </Grid>
                        </Grid>
                    );
                });
            this.forceUpdate()
        });

    }

    render() {
        let name = sagraName;
        if (window.ctx.get("isLogged")) name = "DashBoard";


        return (
            <div id="dash">
                <div>
                    <NavBar titleText={name} history={this.props.history}/>
                </div>
                <div className={this.props.classes.marginTop}>
                    <Hidden xsDown>
                        <Grid container spacing={24} className={this.props.classes.grid}>
                            <Grid item xs={2} justify="center" alignItems="center">
                                {(!window.ctx.get("isLogged") && cfg.react.dashboard_use_ads) && this.ad("vert_", this.state.pub1, this.props.classes.imageV)}
                            </Grid>
                            <Grid item xs={8}>
                                {this.dashboard}
                            </Grid>
                            <Grid item xs={2} justify="center" alignItems="center">
                                {(!window.ctx.get("isLogged") && cfg.react.dashboard_use_ads) && this.ad("vert_", this.state.pub2, this.props.classes.imageV)}
                            </Grid>
                        </Grid>
                    </Hidden>
                    <Hidden smUp>
                        <Grid container spacing={24} justify="center" alignItems="center">
                            <Grid item xs={12} justify="center" alignItems="center">
                                {(!window.ctx.get("isLogged") && cfg.react.dashboard_use_ads) && this.ad("hor_", this.state.pub1, this.props.classes.imageH)}
                            </Grid>
                            <Grid item xs={12} justify="center" alignItems="center">
                                {this.dashboard}
                            </Grid>
                            <Grid item xs={12} justify="center" alignItems="center">
                                {(!window.ctx.get("isLogged") && cfg.react.dashboard_use_ads) && this.ad("hor_", this.state.pub2, this.props.classes.imageH)}
                            </Grid>
                        </Grid>
                    </Hidden>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(Dashboard)