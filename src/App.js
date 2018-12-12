import React from 'react';
import Routes from "./Routes";
import {apiCalls, connection_status} from "./consts";
import {GETSync} from "./network";

class App extends React.Component {

    componentDidMount() {
        this.forceUpdate()
    }

    static getOperationMode() {
        try {
            let hello = GETSync(apiCalls.hello);
            return connection_status[JSON.parse(hello).kind];
        } catch (e) {
            console.log(e);
            return connection_status.noapi;
        }
    };

    render() {
        let result = App.getOperationMode();
        console.log(result);
        return (
            <div className="App">
                <Routes isGuest={result}/>
            </div>
        );
    }
}

export default App;
