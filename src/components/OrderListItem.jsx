import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Avatar from "@material-ui/core/es/Avatar/Avatar";
import Home from "@material-ui/icons/Home"
import ListItem from "@material-ui/core/es/ListItem/ListItem";
import ListItemAvatar from "@material-ui/core/es/ListItemAvatar/ListItemAvatar";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

function getDate(unix_timestamp) {
    let date = new Date(unix_timestamp * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    let day = "0" + date.getDate();
    let month = "0" + (date.getMonth() + 1);
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + " - " + day.substr(-2) + "/" + month.substr(-2);
}

class OrderListItem extends React.Component {

    state = {anchorEl: null};

    handleMenu = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };

    render() {
        const {classes} = this.props;
        const {anchorEl} = this.state;
        const open = Boolean(anchorEl);

        return (
            <ListItem button onClick={this.props.onClick}>
                <ListItemAvatar>
                    <Typography variant='display2'>{this.props.ordnum}</Typography>
                </ListItemAvatar>
                <ListItemText
                    primary={this.props.id.substr(0, 16) + (this.props.id.length > 16 ? "..." : "")}
                    secondary={this.props.user + " @ " + getDate(this.props.time)}
                />
            </ListItem>
        );
    }
}


export default withStyles(styles)(OrderListItem);