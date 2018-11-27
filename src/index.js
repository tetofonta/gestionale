import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import {POST} from "./network";
import {apiCalls} from "./consts";

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