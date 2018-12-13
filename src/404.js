import React from "react";

import NavBar from './components/NavBar'

export default class Err404 extends React.Component {
    render() {
        return (
            <div id="dash">
                <NavBar titleText="404 - Pagina non trovata =(" showHome={true} state={{auth: false, anchorEl: null}}/>
            </div>
        );
    }
}