import React from 'react';
import {Route, Switch} from 'react-router-dom'
import {apiCalls, connection_status} from "./consts"
import Dashboard from './Dashboard';
import Login from './Login';
import Err404 from "./404";
import Err500 from "./500";
import {GETSync} from "./network";
import Users from "./Users";

export default class Router extends React.Component {

    operations = {
        privated: [],
        publiced: []
    };

    componentDidMount() {
        let md = require('./modules');
        if(md.modules["users"] && md.modules["users"].enabled)
            this.operations.privated.push(<Route path={"/users"} component={Users}/>)
        let res = JSON.parse(GETSync(apiCalls.getAllFncs));
        console.log(res);
        res.privates.forEach(e => {
            if (md.modules[e.moduleName] && md.modules[e.moduleName].enabled) {
                let {classe} = require(`${md.modules[e.moduleName].modulePath}`);
                this.operations.privated.push(<Route path={e.too} component={classe}/>)
            }
        });
        res.publics.forEach(e => {
            if (md.modules[e.moduleName] && md.modules[e.moduleName].enabled) {
                let {classe} = require(`${md.modules[e.moduleName].modulePath}`);
                this.operations.publiced.push(<Route path={e.too} component={classe}/>)
            }
        })
    }

    render() {
        if (this.props.isGuest === connection_status.noapi)
            return (<main><Err500/></main>);

        return (
            <main>
                <link rel="stylesheet" href="/Font-Awesome/css/all.css"/>
                <Switch>
                    <Route exact path='/' component={
                        this.props.isGuest === connection_status.client ? Login : Dashboard
                    }/>
                    <Route path='/dashboard' component={Dashboard}/>
                    {this.props.isGuest === connection_status.client && this.operations.privated}

                    {this.operations.publiced.map(e => e)}
                    <Route component={Err404}/>
                </Switch>
            </main>
        );
    }
}
