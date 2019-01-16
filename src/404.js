import React from "react";

import NavBar from './components/NavBar'
import Grid from "@material-ui/core/es/Grid/Grid";
import Typography from "@material-ui/core/es/Typography/Typography";
import Paper from "@material-ui/core/es/Paper/Paper";
import {withStyles} from "@material-ui/core/styles/index";

const styles = theme => ({
    marginTop: {
        marginTop: 64,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden"
    }
});


class Err404 extends React.Component {
    render() {
        return (
            <div id="dash">
                <NavBar titleText="404 - Pagina non trovata =(" showHome={true} state={{auth: false, anchorEl: null}}/>
                <Paper className={this.props.classes.marginTop}>
                    <Grid container spacing={24} justify="center" alignItems="center">
                        <Grid item xs={12}>
                            <Typography variant="display4"><i className="fas fa-sad-tear"/></Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(Err404)