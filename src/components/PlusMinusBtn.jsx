import React from "react";
import Button from "@material-ui/core/es/Button/Button";
import AddIcon from "@material-ui/icons/Add"
import MinusIcon from "@material-ui/icons/Remove"

export default class PlusMinusButton extends React.Component{

	render(){
		return <div>
<Button variant="contained" color="primary" onClick={this.props.onPlus}><AddIcon/></Button>
<Button variant="contained" color="secondary" onClick={this.props.onMinus}><MinusIcon/></Button>
</div>
	}
}