import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import Paper from "@material-ui/core/es/Paper/Paper";
import TextField from "@material-ui/core/es/TextField/TextField";
import Button from "@material-ui/core/es/Button/Button";
import Snackbar from "@material-ui/core/es/Snackbar/Snackbar";
import {POST} from "./network";
import {apiCalls} from "./consts";


const styles = theme => ({
    marginTop: {
        marginTop: 66,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        zIndex: -2
    },
    centred: {
        margin: "auto",
        display: "block",
        marginTop: "40px"
    },
});

class OrderOprions extends React.Component {

    state = {};
    value = "";

    componentDidMount() {
        POST(apiCalls.operate, {
            user: window.ctx.get("username"),
            token: window.ctx.get("token"),
            set: false
        }).then(r => {
            if (r.state)
                this.setState({currentno: r.num});
            else this.setState({open: true, message: r.err});
        })
    }

    render() {
        return (
            <div>
                <NavBar titleText='Gestione numero ordine' history={this.props.history} showHome={true}/>
                <Paper className={this.props.classes.marginTop}>
                    <div className={this.props.classes.centred}>
                        <TextField placeholder={this.state.currentno} onChange={(e) => this.value = e.target.value} style={{padding: 10}}/>
                        <Button style={{padding: 10}} onClick={() => {
                            POST(apiCalls.operate, {
                                user: window.ctx.get("username"),
                                token: window.ctx.get("token"),
                                set: true,
                                value: this.value
                            }).then(r => {
                                this.setState({open: true, message: r.err});
                            })
                        }} variant="contained" colo="primary">Imposta</Button>
                    </div>
                </Paper>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.open}
                    autoHideDuration={6000}
                    onClose={() => this.setState({open: false})}
                    message={<span id="message-id">{this.state.message}</span>}
                />
            </div>)
            ;
    }
}

let classe = withStyles(styles)(OrderOprions);
export {classe}
export default withStyles(styles)(OrderOprions)