import React from "react";

import NavBar from './components/NavBar'

export default class Err500 extends React.Component {
    render() {
        return (
            <div id="dash">
                <NavBar titleText="500 - Pagina non trovata =(" showHome={true}  state={{auth: false, anchorEl: null}}/>
            </div>
        );
    }
}