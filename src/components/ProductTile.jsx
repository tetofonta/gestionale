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
        height: productsHeight,
        textAlign: 'center',
        margin: 0,
        minWidth: tileWidth
    },
    paperTitle: {
        padding: '15px',
        textAlign: 'center',
        margin: 0,
        width: '100%'
    },
    enabled: {},
    disabled: {
        backgroundColor: "#ccc"
    },
    btn: {
        width: '100%',
        minWidth: 200,
        margin: 12
    }
});


class ProductTile extends React.Component {

    render() {
        return (
            <ButtonBase disabled={!this.props.dispon} onClick={this.props.onClick}>
                <Paper
                    className={[this.props.classes.paper, this.props.dispon ? this.props.classes.enabled : this.props.classes.disabled].join(' ')}>
                    <Grid container spacing={24} justify="center" alignItems="center">
                        <Grid item xs={8} justify="center" alignItems="center">
                            <Grid item xs={this.props.tabspace}>
                                <Grid container spacing={0} justify="center" alignItems="center"
                                      className={this.props.classes.btn}>
                                    <Grid item xs={12}>
                                        <Typography variant='headline'>{this.props.desc}</Typography>
                                    </Grid>
                                    <Grid item xs={3}/>
                                    <Grid item xs={2}>
                                        <Typography variant='title'>{this.props.eur},</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography
                                            variant='subheading'>{(this.props.cents < 10) ? ("0" + this.props.cents) : this.props.cents}</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography variant='title'>{Currency}</Typography>
                                    </Grid>
                                    <Grid item xs={3}/>
                                    <Grid item xs={1}>
                                        {this.props.details.display &&
                                        <Button onClick={this.props.onDetailsClick}>
                                            <Typography
                                            variant='display1'><EditIcon/></Typography></Button>
                                        }
                                    </Grid>
                                    <Grid item xs={10}/>
                                    <Grid item xs={1}>
                                        {this.props.info !== null &&
                                        <Tooltip title={this.props.info} placement="left-start">
                                            <Typography variant='display1'><InfoIcon/></Typography>
                                        </Tooltip>}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={4} justify="center" alignItems="center">
                            <Typography
                                variant="display2">{this.props.qta}</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </ButtonBase>
        )
    }
}

export default withStyles(styles)(ProductTile)

