import React from "react"
import {withStyles} from '@material-ui/core/styles';
import {CategoryHeight, Currency, productsHeight, tileWidth} from "../consts";
import ButtonBase from "@material-ui/core/es/ButtonBase/ButtonBase";
import Typography from "@material-ui/core/es/Typography/Typography";
import Paper from "@material-ui/core/es/Paper/Paper";
import Grid from "@material-ui/core/es/Grid/Grid";
import Button from "@material-ui/core/es/Button/Button";
import Tooltip from "@material-ui/core/es/Tooltip/Tooltip";
import InfoIcon from "@material-ui/icons/Info"
import AddIcon from "@material-ui/icons/Add"
import EditIcon from "@material-ui/icons/Edit"
import MinusIcon from "@material-ui/icons/Remove"

const styles = theme => ({
    paper: {
        padding: '15px',
        textAlign: 'center',
        margin: "5%",
        width: 200,
        height: 180,
        position: 'relative'
    },
    info: {
        position: 'absolute',
        bottom: 10,
        left: 10
    },
    icon: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        fontSize: '5rem'
    }
});


class FunctionTile extends React.Component {

    render() {
        return (
            <ButtonBase onClick={this.props.onClick}>
                <Paper
                    className={this.props.classes.paper}>
                    <Typography align='left' variant="title">{this.props.title}</Typography>
                    <Typography align='left' variant="subheading">{this.props.descr}</Typography>

                    <i className={this.props.classes.icon + " " + this.props.icon}/>

                    { this.props.tooltip != null && <Tooltip title= { this.props.tooltip }>
                        <InfoIcon className={this.props.classes.info}/>
                    </Tooltip>}
                </Paper>
            </ButtonBase>
        )
    }
}

export default withStyles(styles)(FunctionTile)

