import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockIcon from '@material-ui/icons/LockOutlined';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import withStyles from '@material-ui/core/styles/withStyles';
import {auth} from './auth'
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/es/DialogContentText/DialogContentText";
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import Link from "react-router-dom/es/Link";
import {loginLogo} from "./consts";

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

class Login extends React.Component {

    continueLIN = () => {
        this.props.history.push("/dashboard");
    };
    show = (title, text, val) => {
        this.setState({tex: text});
        this.setState({titl: title});
        this.setState({showed: val});
    };

    state = {
        tex: "WhyI'mHERE?",
        titl: "WhyI'mHERE?",
        showed: false,
    };

    render() {
        const {classes} = this.props;

        let creds = {
            username: "",
            password: "",
        };

        if (window.ctx.get("isLogged")) {
            this.props.history.push('/dashboard');
            return (<main>Already logged in.</main>);
        }

        return (
            <div>
                <CssBaseline/>
                <main className={classes.layout}>
                    <Paper className={classes.paper}>
                        {loginLogo}
                        <Typography variant="headline">Login</Typography>
                        <form className={classes.form}>
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
                                    id="password"
                                    autoComplete="current-password"
                                    onChange={evt => creds.password = evt.target.value}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter')
                                            auth(this.continueLIN, creds.username, creds.password, this.show)
                                    }}
                                />
                            </FormControl>
                            <Button
                                fullWidth
                                variant="raised"
                                color="primary"
                                className={classes.submit}
                                onClick={() => {
                                    auth(this.continueLIN, creds.username, creds.password, this.show)
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                fullWidth
                                variant="raised"
                                color="primary"
                                className={classes.submit}
                                onClick={() => {
                                    this.props.history.push("/dashboard");
                                }}
                            >
                                Login as Guest
                            </Button>

                        </form>
                    </Paper>
                    <Dialog
                        open={this.state.showed}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{this.state.titl}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.state.tex}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                this.show("", "", false);
                                this.continueLIN();
                            }} color="primary">
                                OK
                            </Button>
                        </DialogActions>
                    </Dialog>
                </main>
            </div>
        );
    }
}

export default withStyles(styles)(Login)