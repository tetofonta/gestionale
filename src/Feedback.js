import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import {GET, POST} from "./network";
import {apiCalls} from "./consts";
import Stepper from "@material-ui/core/es/Stepper/Stepper";
import Step from "@material-ui/core/es/Step/Step";
import StepLabel from "@material-ui/core/es/StepLabel/StepLabel";
import StepContent from "@material-ui/core/es/StepContent/StepContent";
import Typography from "@material-ui/core/es/Typography/Typography";
import Button from "@material-ui/core/es/Button/Button";
import Paper from "@material-ui/core/es/Paper/Paper";
import Checkbox from "@material-ui/core/es/Checkbox/Checkbox";
import StarIcon from "@material-ui/icons/Star"
import StarIconBorder from "@material-ui/icons/StarBorder"
import TextField from "@material-ui/core/es/TextField/TextField";
import Grid from "@material-ui/core/es/Grid/Grid";


const styles = theme => ({
    marginTop: {
        marginTop: 64,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        overflowX: "hidden"
    },
    root: {
        width: '99%',
    },
    button: {
        marginTop: theme.spacing.unit,
        marginRight: theme.spacing.unit,
    },
    actionsContainer: {
        marginBottom: theme.spacing.unit * 2,
    },
    resetContainer: {
        padding: theme.spacing.unit * 3,
    },
    CheckboxRoot: {
        color: "#EE0",
        '&$checked': {
            color: "#EE0"
        },
    },
    checked: {},
    full: {
        width: "80vw"
    }
});

class Template extends React.Component {

    state = {
        questions: [],
        activeQuestion: 0,
        finished: false
    };


    componentDidMount() {
        if (window.feedbackTimeout) clearTimeout(window.feedbackTimeout);
        GET(apiCalls.getFeedback).then(res => {
            if (res.state) this.setState({questions: res.result});
            else console.log(res)
        })
    }

    render() {
        return (
            <div>
                <NavBar titleText='Feedback' history={this.props.history} showHome={true}/>
                <Paper className={this.props.classes.marginTop}>
                    <div className={this.props.classes.root}>
                        {!this.state.finished && <Stepper activeStep={this.state.activeQuestion} className={this.props.classes.full}
                                 orientation="vertical">
                            {this.state.questions.map((e, i) => {
                                return (
                                    <Step key={e}>
                                        <StepLabel>{e.title}</StepLabel>
                                        <StepContent>
                                            <Typography>{e.testo}</Typography>
                                            {e.answerType === 1 && <div>
                                                <Button onClick={() => {e.answered = 'YES'; this.forceUpdate();}} color="primary" variant={(e.answered && e.answered === "YES") ? "contained" : ""}>SI</Button>
                                                <Button onClick={() => {e.answered = 'NO'; this.forceUpdate();}} color="secondary" variant={(e.answered && e.answered === "NO") ? "contained" : ""}>NO</Button>
                                            </div>}

                                            {e.answerType === 2 && <div>
                                                {[0, 1, 2, 3, 4].map(q =>
                                                    <Checkbox checked={e.answered > q} onChange={(evt) => {e.answered = q+1; this.forceUpdate()}} classes={{
                                                        root: this.props.classes.CheckboxRoot,
                                                        checked: this.props.classes.checked
                                                    }} icon={<StarIconBorder/>} checkedIcon={<StarIcon/>} value={q}/>)}

                                            </div>}

                                            {(e.answerType === 3 || e.details === 1) && <TextField onChange={(evt) => {e.details = evt.target.value}} className={this.props.classes.root}
                                                label={e.answerType === 3 ? "Risposta" : "Vuoi aggiungere qualcosa?"}/>}

                                            <div className={this.props.classes.actionsContainer}>
                                                <div>
                                                    <Button
                                                        disabled={this.state.activeQuestion === 0}
                                                        onClick={() => this.setState({activeQuestion: this.state.activeQuestion - 1})}
                                                        className={this.props.classes.button}
                                                    >
                                                        Indietro
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() =>{
                                                            if(this.state.activeQuestion !== this.state.questions.length - 1) this.setState({activeQuestion: this.state.activeQuestion + 1});
                                                            else {
                                                                POST(apiCalls.sendFeed, {answers: this.state.questions.map(q => {
                                                                        return {
                                                                            id: q.id,
                                                                            answer: q.answered ? q.answered : "-",
                                                                            details: q.details ? q.details : "-"
                                                                        }
                                                                    })}).then(() => {
                                                                    this.setState({finished: true})
                                                                })
                                                            }
                                                        }}
                                                        className={this.props.classes.button}
                                                    >
                                                        {this.state.activeQuestion === this.state.questions.length - 1 ? 'Fine' : 'Avanti'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </StepContent>
                                    </Step>
                                );
                            })}
                        </Stepper>}
                        {this.state.finished && <Grid container spacing={32} alignContent="center" alignItems="center">
                            <Grid item xs={1}/>
                            <Grid item xs={11}>
                                <Typography variant="display3">Grazie del tuo tempo!</Typography>
                            </Grid>
                            <Grid item xs={1}/>
                            <Grid item xs={11}>
                                <Button variant="contained" onClick={() => this.props.history.push("/")}>Torna alla Home</Button>
                            </Grid>
                        </Grid>}
                    </div>
                </Paper>
            </div>)
            ;
    }
}

let classe = withStyles(styles)(Template);
export {classe}
export default withStyles(styles)(Template)