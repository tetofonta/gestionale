import React, {Component} from 'react';
import Routes from "./Routes";
import NetComponent from "./NetComponent";
import {connection_status} from "./consts"

class App extends NetComponent {

    componentDidMount(){
        this.forceUpdate()
    }

    render() {
        let result = this.getOperationMode();
        console.log(result);
        return (
            <div className="App">
                <Routes isGuest={result}/>
            </div>
        );
    }
}

export default App;
