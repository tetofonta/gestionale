import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {apiCalls, loginLogo} from "./consts";
import {POST, POSTSync} from "./network"
import * as cfg from "./configs/network.config"
import QrReader from "react-qr-reader";


const styles = theme => ({
    layout: {
        width: 'auto',
        display: 'block', // Fix IE11 issue.
        marginLeft: theme.spacing.unit * 3,
        marginRight: theme.spacing.unit * 3,
        [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing.unit * 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
    },
    avatar: {
        margin: theme.spacing.unit * 2,
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE11 issue.
        marginTop: theme.spacing.unit,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
});

class NetworkLogin extends React.Component {

    state = {

    };

    login(user, password) {
        POST(apiCalls.loginnw, {usr: user, psw: password}).then(res => {
            if(res.state){
                window.location.href = "https://www.google.com/";
            }
            else{
                console.log(res)
                this.setState({message: "CREDENZIALI NON ABILITATE"})
            }
        })
    }

    render() {
        const {classes} = this.props;

        let creds = {
            username: "",
            password: "",
        };

        return (
            <div>
                <CssBaseline/>
                <main className={classes.layout}>
                    <Paper className={classes.paper}>
                        {loginLogo}
                        <Typography variant="headline">Entra nella Rete</Typography>
                        <form className={classes.form}>

                            {!this.state.useTextMode && <div>
                                <QrReader
                                    delay={500}
                                    onError={(e) => this.setState({message: e.toString()})}
                                    onScan={(e) => {
                                        try {
                                            let obj = JSON.parse(e);
                                            if (obj.plugin && obj.plugin.networklogin && obj.plugin.networklogin.user && obj.plugin.networklogin.password)
                                                this.login(obj.plugin.networklogin.user, obj.plugin.networklogin.password);
                                            else this.setState({message: "QR Code errato."})
                                        } catch (e) {
                                            this.setState({message: "Impossibile decodificare il codice QR."})
                                        }
                                    }}
                                />
                                <Typography>{this.state.message}</Typography>
                                <Button
                                    fullWidth
                                    variant="raised"
                                    color="primary"
                                    className={classes.submit}
                                    onClick={() => this.setState({useTextMode: true})}
                                >
                                    Inserisci manualmente
                                </Button>
                            </div>
                            }

                            {this.state.useTextMode &&
                            <div>
                                <FormControl margin="normal" required fullWidth>
                                    <InputLabel htmlFor="email">Nome utente</InputLabel>
                                    <Input id="email" name="email" autoComplete="email" autoFocus
                                           onChange={evt => creds.username = evt.target.value}/>
                                </FormControl>
                                <FormControl margin="normal" required fullWidth>
                                    <InputLabel htmlFor="password">Password</InputLabel>
                                    <Input
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        onChange={evt => creds.password = evt.target.value}
                                    />
                                </FormControl>
                                <Typography>{this.state.message}</Typography>
                                <Button
                                    fullWidth
                                    variant="raised"
                                    color="primary"
                                    className={classes.submit}
                                    onClick={() => this.login(creds.username, creds.password)}
                                >
                                    Login
                                </Button>
                            </div>}

                            <Button
                                fullWidth
                                variant="raised"
                                color="primary"
                                className={classes.submit}
                                onClick={() => this.props.history.push("/")}
                            >
                                TORNA ALLA HOME PAGE
                            </Button>
                        </form>
                    </Paper>
                </main>
            </div>
        );
    }
}

function getdata() {
    let answ = POSTSync(apiCalls.getNWCreds, {user: window.ctx.get("username"), token: window.ctx.get("token")});
    answ = JSON.parse(answ);
    if (answ.state)
        return {user: answ.usr, password: answ.psw};

    console.log(answ);
    return {user: "", password: ""};
}

let classe = withStyles(styles)(NetworkLogin);
export {classe, getdata}
export default withStyles(styles)(NetworkLogin);