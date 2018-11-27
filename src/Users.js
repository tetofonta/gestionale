import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import NavBar from "./components/NavBar";
import {POST} from "./network";
import ListItem from "@material-ui/core/es/ListItem/ListItem";
import ListItemIcon from "@material-ui/core/es/ListItemIcon/ListItemIcon";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";
import AccountCircle from '@material-ui/icons/AccountCircle'
import StarIcon from '@material-ui/icons/Star';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Grid from "@material-ui/core/es/Grid/Grid";
import Paper from "@material-ui/core/es/Paper/Paper";
import FormControlLabel from "@material-ui/core/es/FormControlLabel/FormControlLabel";
import Checkbox from "@material-ui/core/es/Checkbox/Checkbox";
import TextField from "@material-ui/core/es/TextField/TextField";
import Button from "@material-ui/core/es/Button/Button";
import FormControl from "@material-ui/core/es/FormControl/FormControl";
import InputLabel from "@material-ui/core/es/InputLabel/InputLabel";
import Input from "@material-ui/core/es/Input/Input";
import Snackbar from "@material-ui/core/es/Snackbar/Snackbar";
import IconButton from "@material-ui/core/es/IconButton/IconButton";
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/es/DialogContentText/DialogContentText";
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import Hidden from "@material-ui/core/es/Hidden/Hidden";
import {auth} from "./auth";
import {apiCalls} from "./consts";


const drawerWidth = 240;

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: '100vh',
        zIndex: 1,
        position: 'relative',
        display: 'flex',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar,
    paper: {
        padding: '8px',
        minHeight: '90px',
        textAlign: 'center'
    }
});

class Users extends React.Component {
    classes = this.props.classes;

    state = {
        usersList: [],

        lastUser: "",
        lastName: "",
        lastIsAdmin: false,
        edited: false,

        editPsw: false,
        lastPassword: "",
        lastPasswordCh: "",

        privs_d: [],
        statuses: [],

        open: false,
        newAdmin: false,
        snacktext: "COOOOS",
        DialogOpen: false
    };

    componentDidMount() {
        POST(apiCalls.userList, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                let temp = [];
                console.log(res);
                for (let i = 0, l = res.list.length; i < l; i++) {
                    temp.push(
                        <ListItem key={i} button onClick={() => {
                            this.setState({
                                edited: false,
                                lastUser: res.list[i].username,
                                lastName: res.list[i].name,
                                lastIsAdmin: res.list[i].isAdmin === 1
                            });

                            let mp = [];
                            this.state.privs_d.forEach(e => {
                                mp.push(res.list[i].privs.indexOf(e) !== -1);
                            });
                            this.setState({statuses: mp});
                            console.log(mp);
                        }}>
                            <ListItemIcon>
                                {res.list[i].isAdmin ? <StarIcon/> : <AccountCircle/>}
                            </ListItemIcon>
                            <ListItemText primary={res.list[i].name} secondary={res.list[i].username}/>
                        </ListItem>
                    );
                }

                window.ctx.get("admin") && temp.push(
                    <ListItem key={-1} button onClick={() => {
                        this.setState({
                            DialogOpen: true
                        });
                    }}>
                        <ListItemIcon>
                            <AddIcon/>
                        </ListItemIcon>
                        <ListItemText primary='Aggiungi utente'/>
                    </ListItem>
                );

                for (let i = 0; i < res.privs.length; i++) {
                    this.state.statuses.push(false);
                }
                this.setState({usersList: temp, privs_d: res.privs});
                if (res.list.length > 0) {
                    this.setState({
                        edited: false,
                        lastUser: res.list[0].username,
                        lastName: res.list[0].name,
                        lastIsAdmin: res.list[0].isAdmin === 1
                    });
                    let mp = [];
                    this.state.privs_d.forEach(e => {
                        mp.push(res.list[0].privs.indexOf(e) !== -1);
                    });
                    this.setState({statuses: mp});
                }
            }
        });
    }

    newUsername = "";
    newPassword = "";
    newName = "";
    newAdmin = false;

    render() {

        return (
            <div className={this.classes.root}>
                <NavBar titleText='Gestione utenti' history={this.props.history} classes={{appBar: this.classes.appBar}}
                        showHome={true}/>
                <Hidden smDown implementation="css">
                    <Drawer
                        variant="permanent"
                        classes={{
                            paper: this.classes.drawerPaper,
                        }}
                    >
                        <div className={this.classes.toolbar}/>
                        <List>{this.state.usersList}</List>
                    </Drawer>
                </Hidden>
                <Hidden mdUp>
                    <Drawer
                        variant="temporary"
                        anchor="left"
                        // open={this.state.mobileOpen}
                        // onClose={this.handleDrawerToggle}
                        classes={{
                            paper: this.props.classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        <div className={this.classes.toolbar}/>
                        <List>{this.state.usersList}</List>
                    </Drawer>
                </Hidden>
                <main className={this.classes.content}>
                    <div className={this.classes.toolbar}/>
                    <Grid container spacing={24} justify="center" alignItems="center">
                        <Grid item xs={12} justify="center" alignItems="center">
                            <Paper className={this.classes.paper}><Typography noWrap
                                                                              variant='display3'>{this.state.lastUser}</Typography></Paper>
                        </Grid>
                        <Grid item xs={8} justify="center" alignItems="center">
                            <Paper className={this.classes.paper}>Nome:
                                <FormControl margin="normal" fullWidth>
                                    <Input id="name" name="name" placeholder={this.state.lastName}
                                           onChange={(evt) => {
                                               this.setState({edited: true, lastName: evt.target.value});
                                           }}/>
                                </FormControl>
                            </Paper>
                        </Grid>
                        <Grid item xs={4} justify="center" alignItems="center">
                            <Paper className={this.classes.paper}>
                                <FormControlLabel
                                    disabled={!window.ctx.get("admin")}
                                    control={
                                        <Checkbox
                                            checked={this.state.lastIsAdmin}
                                            onChange={(evt) => {
                                                this.setState({
                                                    edited: true, lastIsAdmin: evt.target.checked
                                                });
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label="Amministratore"
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} justify="center" alignItems="center">
                            <Paper className={this.classes.paper}>

                                {this.state.statuses.map((v, i) => {
                                    return <FormControlLabel
                                        disabled={!window.ctx.get("admin")}
                                        control={
                                            <Checkbox
                                                checked={v}
                                                onChange={(evt) => {
                                                    let st = this.state.statuses;
                                                    st[i] = evt.target.checked;
                                                    this.setState({statuses: st, edited: true});
                                                    console.log(this.state.statuses)
                                                }}
                                                color="primary"
                                            />
                                        }
                                        label={this.state.privs_d[i]}
                                    />
                                })}

                            </Paper>
                        </Grid>

                        <Grid item xs={6}/>
                        <Grid item xs={4} justify="center" alignItems="center">
                            <Paper className={this.classes.paper}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.editPsw}
                                            onChange={(evt) => {
                                                this.setState({editPsw: evt.target.checked, edited: true});
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label='Modifica password'
                                />
                                {this.state.editPsw &&
                                <div>
                                    <FormControl disabled={!this.state.editPsw} margin="normal" fullWidth>
                                        <Input type='password' id="psw" name="psw" placeholder='Nuova Password'
                                               onChange={(evt) => {
                                                   this.setState({edited: true, lastPassword: evt.target.value});
                                               }}/>
                                    </FormControl>
                                    <FormControl disabled={!this.state.editPsw} margin="normal" fullWidth>
                                        <Input type='password' id="psw" name="psw" placeholder='Ripeti Password'
                                               onChange={(evt) => {
                                                   this.setState({edited: true, lastPasswordCh: evt.target.value});
                                               }}/>
                                    </FormControl>
                                </div>}
                            </Paper>
                        </Grid>
                        <Grid item xs={2} justify="center" alignItems="center">
                            <Paper className={this.classes.paper}>
                                <Button variant="contained" color="primary" disabled={!this.state.edited}
                                        onClick={
                                            () => {
                                                if (!this.state.editPsw || this.state.lastPasswordCh === this.state.lastPassword && this.state.lastPassword !== "")
                                                    POST(apiCalls.editUser, {
                                                        user: window.ctx.get("username"),
                                                        token: window.ctx.get("token"),
                                                        modusername: this.state.lastUser,
                                                        name: this.state.lastName,
                                                        admin: this.state.lastIsAdmin,
                                                        states: this.state.statuses,
                                                        descr: this.state.privs_d,
                                                        editPsw: this.state.editPsw,
                                                        newPsw: this.state.lastPassword
                                                    }).then(res => {
                                                        console.log(res);
                                                        if (res.state) {
                                                            this.setState({snacktext: res.err, open: true});

                                                        }
                                                    });
                                                else this.setState({
                                                    snacktext: "Le password inserite non corrispondono!",
                                                    open: true
                                                });
                                            }
                                        }>
                                    Aggiorna</Button>
                                {window.ctx.get("admin") !== 0 && <Button variant="contained" color="secondary"
                                                                          onClick={
                                                                              () => {
                                                                                  if (window.confirm(`Sei sicuro di voler eliminare -- ${this.state.lastName} --`)) {
                                                                                      POST(apiCalls.delUser, {
                                                                                          user: window.ctx.get("username"),
                                                                                          token: window.ctx.get("token"),
                                                                                          modusername: this.state.lastUser,
                                                                                      }).then(res => {
                                                                                          console.log(res);
                                                                                          this.setState({
                                                                                              snacktext: res.err,
                                                                                              open: true
                                                                                          });
                                                                                          this.props.history.push("/dashboard")
                                                                                      });
                                                                                  } else {
                                                                                      alert("Coglione.");
                                                                                  }
                                                                              }
                                                                          }>
                                    Elimina</Button>}
                            </Paper>
                        </Grid>

                    </Grid>
                </main>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.open}
                    autoHideDuration={3000}
                    onClose={this.handleClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.snacktext}</span>}
                    action={[
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={this.classes.close}
                            onClick={() => this.setState({open: false})}
                        >
                            <CloseIcon/>
                        </IconButton>,
                    ]}
                />
                {window.ctx.get("admin") &&
                <Dialog
                    open={this.state.DialogOpen}
                    onClose={() => this.setState({DialogOpen: false})}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Nuovo utente</DialogTitle>
                    <DialogContent>
                        <form className={this.classes.form}>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="user">Username</InputLabel>
                                <Input id="user" name="user"
                                       onChange={evt => this.newUsername = evt.target.value}/>
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="name">Nome</InputLabel>
                                <Input id="name" name="name"
                                       onChange={evt => this.newName = evt.target.value}/>
                            </FormControl>
                            <FormControl margin="normal" required fullWidth>
                                <InputLabel htmlFor="psw">Password</InputLabel>
                                <Input type='password' id="psw" name="psw"
                                       onChange={evt => this.newPassword = evt.target.value}/>
                            </FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={this.state.newAdmin}
                                        onChange={(evt) => {
                                            this.setState({newAdmin: evt.target.checked});
                                            this.newAdmin = evt.target.checked;
                                        }}
                                        color="primary"
                                    />
                                }
                                label='Amministratore'
                            />

                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({DialogOpen: false})} color="secondary">
                            Annulla
                        </Button>
                        <Button onClick={() => {
                            POST(apiCalls.newUser, {
                                newuser: this.newUsername,
                                name: this.newName,
                                psw: this.newPassword,
                                admin: this.newAdmin,
                                user: window.ctx.get("username"),
                                token: window.ctx.get("token"),
                            }).then((res) => {
                                this.setState({
                                    snacktext: res.err,
                                    open: true
                                });
                                this.state.usersList = [(
                                    <ListItem key={42} button onClick={() => {
                                        this.setState({
                                            edited: false,
                                            lastUser: this.newUsername,
                                            lastName: this.newName,
                                            lastIsAdmin: this.newAdmin
                                        });


                                    }}>
                                        <ListItemIcon>
                                            {this.newAdmin ? <StarIcon/> : <AccountCircle/>}
                                        </ListItemIcon>
                                        <ListItemText primary={this.newName} secondary={this.newUsername}/>
                                    </ListItem>
                                ), ...this.state.usersList];
                                this.setState({DialogOpen: false})
                            });
                        }} color="primary" autoFocus>
                            Conferma
                        </Button>
                    </DialogActions>
                </Dialog>}
            </div>
        );
    }
}

Users.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Users);
