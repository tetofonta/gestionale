import React from 'react';
import {Switch, Route} from 'react-router-dom'
import {connection_status} from "./consts"


import Dashboard from './Dashboard';
import Users from './Users';
import Login from './Login';
import Err404 from "./404";
import Err500 from "./500";
import Cassa from "./Cassa";
import Editor from "./Editor";
import Buoni from "./Buoni";

export default class Router extends React.Component {
    render() {
        if(this.props.isGuest === connection_status.noapi)
            return (<main><Err500/></main>);

        let operations = [
            <Route path='/users' component={Users}/>,
            <Route path='/editor' component={Editor}/>,
            <Route path='/buoni' component={Buoni}/>
        ];

        return (
            <main>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css"
                      integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU"
                      crossOrigin="anonymous"/>
                <Switch>
                    <Route exact path='/' component={
                        this.props.isGuest === connection_status.client ? Login : Dashboard
                    }/>
                    <Route path='/dashboard' component={Dashboard}/>
                    {this.props.isGuest === connection_status.client && operations }

                    <Route path='/newOrdine' component={Cassa}/>
                    <Route component={Err404} />
                </Switch>
            </main>
        );
    }
}
