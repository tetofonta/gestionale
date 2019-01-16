import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {POST} from "./network";
import {apiCalls} from "./consts";

//if(window.location.hostname !== cfg.serverIP)
//    window.location.href = `https://${cfg.serverIP}/`;

Array.prototype.flat = function () {
    return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.flat()) : acc.concat(val), []);
};


if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') {
    console.log = function (o) {
    };
    console.warn = function (o) {
    };
    console.error = function (o) {
    };
}

let timeoutInMiliseconds = 15 * 60000;
let timeoutId;

function startTimer() {
    // window.setTimeout returns an Id that can be used to start and stop a timer
    timeoutId = window.setTimeout(doInactive, timeoutInMiliseconds)
}

function doInactive() {
    document.cookie = "";
    window.ctx.set("isLogged", false);
    window.location.href = "/";
}

function setupTimers() {
    document.addEventListener("mousemove", resetTimer, false);
    document.addEventListener("mousedown", resetTimer, false);
    document.addEventListener("keypress", resetTimer, false);
    document.addEventListener("touchmove", resetTimer, false);

    startTimer();
}

function resetTimer() {
    window.clearTimeout(timeoutId);
    startTimer();
}

setupTimers();

window.ctx = new Map();
let oldOnes = undefined;
try {
    oldOnes = JSON.parse(document.cookie);
    if (typeof(oldOnes.wasLogged) !== 'undefined' && oldOnes.wasLogged) {
        POST(apiCalls.refresh, {token: oldOnes.token, username: oldOnes.username}).then(res => {
            if (res.state) {
                window.ctx.set("isLogged", true);
                window.ctx.set("username", oldOnes.username);
                window.ctx.set("name", oldOnes.name);
                window.ctx.set("token", res.token);
                window.ctx.set("admin", oldOnes.isAdmin);
                if (oldOnes.nwaccess) window.ctx.set("nwaccess", oldOnes.nwaccess);

                oldOnes.token = res.token;
                document.cookie = JSON.stringify(oldOnes);
            }
            console.log(res);
            ReactDOM.render(<BrowserRouter><App/></BrowserRouter>, document.getElementById('root'));
            registerServiceWorker();
        });
        ReactDOM.render(<BrowserRouter><App/></BrowserRouter>, document.getElementById('root'));
        registerServiceWorker();
    } else {
        ReactDOM.render(<BrowserRouter><App/></BrowserRouter>, document.getElementById('root'));
        registerServiceWorker();
    }
} catch (e) {
    ReactDOM.render(<BrowserRouter><App/></BrowserRouter>, document.getElementById('root'));
    registerServiceWorker();
}
