import React from "react";
import {apiCalls, connection_status} from "./consts";


export default class NetComponent extends React.Component {
    GET = async (path) => {
        const response = await fetch(path);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    GETSync = (path) => {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", path, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    };

    getOperationMode = () => {
        try {
            let hello = this.GETSync(apiCalls.hello);
            return connection_status[JSON.parse(hello).kind];
        } catch (e) {
            console.log(e);
            return connection_status.noapi;
        }
    };
}