import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import {POST, GET, GETSync} from "./network";
import * as cfg from "./configs/network.config"


const styles = theme => ({

});

class Template extends React.Component {

    state = {

    };


    componentDidMount() {
        if(window.feedbackTimeout) clearTimeout(window.feedbackTimeout);
    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div>
                <NavBar titleText='Module Title' history={this.props.history} showHome={true}/>
                {/*components*/}
            </div>)
            ;
    }
}

let classe = withStyles(styles)(Template);
export {classe}
export default withStyles(styles)(Template)