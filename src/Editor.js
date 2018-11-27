import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import Paper from "@material-ui/core/es/Paper/Paper";
import Drawer from "@material-ui/core/es/Drawer/Drawer";
import List from "@material-ui/core/es/List/List";
import ListItem from "@material-ui/core/es/ListItem/ListItem";
import ListItemIcon from "@material-ui/core/es/ListItemIcon/ListItemIcon";
import ListItemText from "@material-ui/core/es/ListItemText/ListItemText";
import TextIcon from '@material-ui/icons/TextFields';
import ImageIcon from '@material-ui/icons/Image';
import CodeIcon from '@material-ui/icons/Code';
import LinkIcon from '@material-ui/icons/Link';
import PreviewIcon from '@material-ui/icons/Slideshow';
import SaveIcon from '@material-ui/icons/Save';
import LineIcon from '@material-ui/icons/LineStyle';
import RectIcon from '@material-ui/icons/CropSquare';
import Divider from "@material-ui/core/es/Divider/Divider";
import Scontrino from "./components/Scontrino";
import Grid from "@material-ui/core/es/Grid/Grid";
import Button from "@material-ui/core/es/Button/Button";
import FullScreenDialog from "./components/FullScreenDialog";
import TextField from "@material-ui/core/es/TextField/TextField";
import AddIcon from "@material-ui/icons/Add"
import Dialog from "@material-ui/core/es/Dialog/Dialog";
import DialogTitle from "@material-ui/core/es/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/es/DialogContent/DialogContent";
import DialogContentText from "@material-ui/core/es/DialogContentText/DialogContentText";
import FormControl from "@material-ui/core/es/FormControl/FormControl";
import InputLabel from "@material-ui/core/es/InputLabel/InputLabel";
import Select from "@material-ui/core/es/Select/Select";
import MenuItem from "@material-ui/core/es/MenuItem/MenuItem";
import * as jsPDF from 'jspdf'
import DialogActions from "@material-ui/core/es/DialogActions/DialogActions";
import FormLabel from "@material-ui/core/es/FormLabel/FormLabel";
import RadioGroup from "@material-ui/core/es/RadioGroup/RadioGroup";
import FormControlLabel from "@material-ui/core/es/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/es/Radio/Radio";
import ListItemAvatar from "@material-ui/core/es/ListItemAvatar/ListItemAvatar";
import Avatar from "@material-ui/core/es/Avatar/Avatar";


const styles = theme => ({
    marginTop: {
        marginTop: 66,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        zIndex: -2
    },
    drawer: {
        width: '20px',
        zIndex: -1,
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
    },
    cvs: {
        width: '100%',
        height: '100%'
    }
});

class Editor extends React.Component {

    state = {
        aliasOpen: false,
        aliases: [],
        newKW: '',
        newAlias: '',
        newValue: '',

        content: [],
        toedit: -1,

        width: 80,
        height: 50,

        json: {
            width: 0,
            header: {},
            element: {},
            footer: {}
        }
    };

    getKeywords() {
        let o = {};
        let i = {};
        this.state.aliases.forEach(e => {
            o[e.kw] = e.alias;
            i[e.kw] = e.value
        });
        return [o, i];
    }

    render() {
        return (
            <div>
                <NavBar titleText='Editor PDF' history={this.props.history} showHome={true}/>
                <Paper className={this.props.classes.marginTop}>
                    <Grid container spacing={32} className={this.props.classes.cvs}>
                        <Grid item xs={1}>
                            <List>
                                <ListItem button onClick={() => {
                                    this.state.content.push({
                                        type: "text",
                                        text: "TEXT",
                                        font: "helvetica",
                                        variant: "normal",
                                        size: 11,
                                        x: 0,
                                        y: 5,
                                        parse: true
                                    });
                                    this.setState({toedit: this.state.content.length - 1, textDialog: true})
                                }}>
                                    <ListItemIcon><TextIcon/></ListItemIcon>
                                </ListItem>
                                <ListItem button>
                                    <ListItemIcon><ImageIcon/></ListItemIcon>
                                </ListItem>
                                <ListItem button onClick={() => {
                                    this.state.content.push({
                                        type: "qr",
                                        data: "ThisIsAQrCode",
                                        parse: true,
                                        bg: "white",
                                        fg: "black",
                                        correction: "H",
                                        size: 100,
                                        x: 30,
                                        y: 30
                                    });
                                    this.setState({toedit: this.state.content.length - 1, qrDialog: true})
                                }}>
                                    <ListItemIcon><CodeIcon/></ListItemIcon>
                                </ListItem>
                                <ListItem button onClick={() => {
                                    this.state.content.push({
                                        type: "reference",
                                        path: "/TEMPLATES/image.json",
                                        x: 10,
                                        y: 10
                                    });
                                    this.setState({toedit: this.state.content.length - 1, linkDialog: true})
                                }}>
                                    <ListItemIcon><LinkIcon/></ListItemIcon>
                                </ListItem>
                                <ListItem button onClick={() => {
                                    this.state.content.push({
                                        type: "line",
                                        coordsx: [10, 10],
                                        coordsy: [0, 0],
                                        width: 1
                                    });
                                    this.setState({toedit: this.state.content.length - 1, lineDialog: true})
                                }}>
                                    <ListItemIcon><LineIcon/></ListItemIcon>
                                </ListItem>
                                <ListItem button onClick={() => {
                                    this.state.content.push({
                                        type: "rect",
                                        dofill: true,
                                        fill: [255, 0, 32],
                                        border: [255, 255, 255],
                                        x: 0,
                                        y: 0,
                                        w: 15,
                                        h: 13,
                                        round: 3
                                    });
                                    this.setState({toedit: this.state.content.length - 1, rectDialog: true})
                                }}>
                                    <ListItemIcon><RectIcon/></ListItemIcon>
                                </ListItem>
                            </List>
                            <Divider/>
                            <List>
                                <ListItem button onClick={() => this.setState({saveDialog: true})}>
                                    <ListItemIcon><SaveIcon/></ListItemIcon>
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={7}>
                            <Scontrino ordnum={3288} object={{
                                width: parseInt(this.state.width),
                                kw: this.getKeywords()[0],
                                header: {height: parseInt(this.state.height), content: this.state.content},
                                element: {height: 0, content: []},
                                footer: {height: 0, content: []}
                            }} kw={this.getKeywords()[1]} elementi={[]}/>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="contained" color="primary" onClick={() => {
                                this.setState({aliasOpen: true})
                            }}>Gestisci keywords</Button>
                            <TextField label='Larghezza' fullWidth
                                       onChange={(e) => this.setState({width: e.target.value})}/>
                            <TextField label='Altezza' fullWidth
                                       onChange={(e) => this.setState({height: e.target.value})}/>

                            <List>
                                {this.state.content.map((e, i) =>
                                    <ListItem button
                                              onClick={() => this.setState({
                                                  toedit: i,
                                                  textDialog: e.type === "text",
                                                  lineDialog: e.type === "line",
                                                  rectDialog: e.type === "rect",
                                                  qrDialog: e.type === "qr",
                                                  linkDialog: e.type === "reference"
                                              })}>
                                        {e.type} {e.type === "text" && `"${e.text}"`} {e.type === "reference" && `"${e.path}"`} {e.type === "qr" && `"${e.data}"`} {e.type === "line" && `(${e.coordsx[0]}, ${e.coordsy[0]}), (${e.coordsx[1]}, ${e.coordsy[1]})`}
                                    </ListItem>
                                )}
                            </List>
                        </Grid>
                    </Grid>
                </Paper>

                {/*aliases*/}
                <FullScreenDialog open={this.state.aliasOpen} onClose={() => {
                    this.setState({aliasOpen: false})
                }} content={
                    <Paper>
                        <Grid container>
                            {this.state.aliases.map(e =>
                                [
                                    <Grid item xs={4}>
                                        {e.kw}
                                    </Grid>,
                                    <Grid item xs={4}>
                                        {e.alias}
                                    </Grid>,
                                    <Grid item xs={3}>
                                        {e.value}
                                    </Grid>,
                                    <Grid item xs={1}/>
                                ])}
                            <Grid item xs={4}>
                                <TextField placeholder={'Keyword'}
                                           onChange={(e) => this.setState({newKW: e.target.value})}/>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField placeholder={'Alias'}
                                           onChange={(e) => this.setState({newAlias: e.target.value})}/>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField placeholder={'Value'}
                                           onChange={(e) => this.setState({newValue: e.target.value})}/>
                            </Grid>
                            <Grid item xs={1}>
                                <Button onClick={() => {
                                    this.state.aliases.push({
                                        kw: this.state.newKW,
                                        alias: this.state.newAlias,
                                        value: this.state.newValue
                                    });
                                    this.forceUpdate()
                                }}><AddIcon/></Button>
                            </Grid>
                        </Grid>
                    </Paper>
                } title='Aliases'/>

                {/*text*/}
                {this.state.textDialog && <Dialog
                    open={this.state.textDialog}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Modifica proprietá testo</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Testo"
                            placeholder={this.state.content[this.state.toedit].text}
                            onChange={(e) => {
                                this.state.content[this.state.toedit].text = e.target.value;
                                this.forceUpdate()
                            }}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel htmlFor="carattere">Carattere</InputLabel>
                            <Select
                                value={this.state.content[this.state.toedit].font}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].font = e.target.value;
                                    this.forceUpdate()
                                }}
                                inputProps={{
                                    name: 'age',
                                    id: 'age-simple',
                                }}
                            >
                                {Object.keys(new jsPDF().getFontList()).map(e => {
                                    if (this.foo) {
                                        this.foo = false;
                                        return <MenuItem value={e}>{e}</MenuItem>
                                    }
                                    this.foo = true;
                                })}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <RadioGroup
                                aria-label="Stile"
                                value={this.state.content[this.state.toedit].variant}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].variant = e.target.value;
                                    this.forceUpdate()
                                }}
                            >
                                <FormControlLabel value="italic" control={<Radio/>} label="Corsivo"/>
                                <FormControlLabel value="bold" control={<Radio/>} label="Grassetto"/>
                                <FormControlLabel value="normal" control={<Radio/>} label="Normale"/>
                            </RadioGroup>
                        </FormControl>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Dimensione (pt)"
                            placeholder={this.state.content[this.state.toedit].size}
                            onChange={(e) => {
                                this.state.content[this.state.toedit].size = parseInt(e.target.value);
                                this.forceUpdate()
                            }}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="X"
                            placeholder={this.state.content[this.state.toedit].x}
                            onChange={(e) => {
                                this.state.content[this.state.toedit].x = parseInt(e.target.value);
                                this.forceUpdate()
                            }}
                            fullWidth
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Y"
                            placeholder={this.state.content[this.state.toedit].y}
                            onChange={(e) => {
                                this.state.content[this.state.toedit].y = parseInt(e.target.value);
                                this.forceUpdate()
                            }}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            this.state.content.splice(this.state.toedit, 1);
                            this.setState({textDialog: false, toedit: -1})
                        }} color="primary">
                            ELIMINA
                        </Button>
                        <Button onClick={() => this.setState({textDialog: false})} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>}

                {/*line*/}
                {this.state.lineDialog && <Dialog
                    open={this.state.lineDialog}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Modifica proprietá linea</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Start X"
                                placeholder={this.state.content[this.state.toedit].coordsx[0]}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].coordsx[0] = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Start Y"
                                placeholder={this.state.content[this.state.toedit].coordsy[0]}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].coordsy[0] = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Finish X"
                                placeholder={this.state.content[this.state.toedit].coordsx[1]}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].coordsx[1] = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Finish Y"
                                placeholder={this.state.content[this.state.toedit].coordsy[1]}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].coordsy[1] = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="width"
                            placeholder={this.state.content[this.state.toedit].width}
                            onChange={(e) => {
                                this.state.content[this.state.toedit].width = parseInt(e.target.value);
                                this.forceUpdate()
                            }}

                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            this.state.content.splice(this.state.toedit, 1);
                            this.setState({lineDialog: false, toedit: -1})
                        }} color="primary">
                            ELIMINA
                        </Button>
                        <Button onClick={() => this.setState({lineDialog: false})} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>}

                {/*rect*/}
                {this.state.rectDialog && <Dialog
                    open={this.state.rectDialog}
                    onClose={this.handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Modifica proprietá rettangolo</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="X"
                                placeholder={this.state.content[this.state.toedit].x}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].x = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Y"
                                placeholder={this.state.content[this.state.toedit].y}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].y = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="W"
                                placeholder={this.state.content[this.state.toedit].w}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].w = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                label="H"
                                placeholder={this.state.content[this.state.toedit].h}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].h = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />

                        </FormControl>
                        <TextField
                            fullWidth
                            autoFocus
                            margin="dense"
                            label="Raccordato"
                            placeholder={this.state.content[this.state.toedit].round}
                            onChange={(e) => {
                                this.state.content[this.state.toedit].round = parseInt(e.target.value);
                                this.forceUpdate()
                            }}

                        />
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="R"
                                placeholder={this.state.content[this.state.toedit].fill[0]}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].round = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                fullWidth
                                autoFocus
                                margin="dense"
                                label="G"
                                placeholder={this.state.content[this.state.toedit].fill[1]}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].round = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                fullWidth
                                autoFocus
                                margin="dense"
                                label="B"
                                placeholder={this.state.content[this.state.toedit].fill[2]}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].round = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            this.state.content.splice(this.state.toedit, 1);
                            this.setState({rectDialog: false, toedit: -1})
                        }} color="primary">
                            ELIMINA
                        </Button>
                        <Button onClick={() => this.setState({rectDialog: false})} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>}

                {/*qr*/}
                {this.state.qrDialog && <Dialog
                    open={this.state.qrDialog}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Modifica proprietá QR</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="X"
                                placeholder={this.state.content[this.state.toedit].x}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].x = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Y"
                                placeholder={this.state.content[this.state.toedit].y}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].y = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Dimensioni"
                                placeholder={this.state.content[this.state.toedit].size}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].size = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>
                        <TextField
                            fullWidth
                            autoFocus
                            margin="dense"
                            label="Contenuto"
                            placeholder={this.state.content[this.state.toedit].data}
                            onChange={(e) => {
                                this.state.content[this.state.toedit].data = e.target.value;
                                this.forceUpdate()
                            }}

                        />
                        <FormControl fullWidth>
                            <InputLabel html-for='correction'> Correzione </InputLabel>
                            <Select
                                value={this.state.content[this.state.toedit].correction}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].correction = e.target.value;
                                    this.forceUpdate()
                                }}
                                inputProps={{
                                    name: 'age',
                                    id: 'correction',
                                }}
                            >
                                <MenuItem value='L'>Bassa</MenuItem>
                                <MenuItem value='M'>Media</MenuItem>
                                <MenuItem value='H'>Alta</MenuItem>
                            </Select>
                        </FormControl>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            this.state.content.splice(this.state.toedit, 1);
                            this.setState({qrDialog: false, toedit: -1})
                        }} color="primary">
                            ELIMINA
                        </Button>
                        <Button onClick={() => this.setState({qrDialog: false})} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>}

                {/*ref*/}
                {this.state.linkDialog && <Dialog
                    open={this.state.linkDialog}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Modifica proprietá Link</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="X"
                                placeholder={this.state.content[this.state.toedit].x}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].x = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Y"
                                placeholder={this.state.content[this.state.toedit].y}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].y = parseInt(e.target.value);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Path"
                                placeholder={this.state.content[this.state.toedit].path}
                                onChange={(e) => {
                                    this.state.content[this.state.toedit].path = parseInt(e.target.path);
                                    this.forceUpdate()
                                }}

                            />
                        </FormControl>

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            this.state.content.splice(this.state.toedit, 1);
                            this.setState({linkDialog: false, toedit: -1})
                        }} color="primary">
                            ELIMINA
                        </Button>
                        <Button onClick={() => this.setState({linkDialog: false})} color="primary">
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>}

                {/*save*/}
                {this.state.saveDialog &&
                <Dialog open={this.state.saveDialog} onClose={() => this.setState({saveDialog: false})}>
                    <DialogTitle id="simple-dialog-title">Salvataggio parte</DialogTitle>
                    <div>
                        <List>
                            <ListItem button onClick={() => {
                                this.state.json.header.height = this.state.height;
                                this.state.json.width = this.state.width;
                                this.state.json.header.content = JSON.parse(JSON.stringify(this.state.content));
                                this.setState({height: 50, saveDialog: false, content: []})
                            }}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <SaveIcon/>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={'Salva header'}/>
                            </ListItem>
                            <ListItem button onClick={() => {
                                this.state.json.element.height = this.state.height;
                                this.state.json.width = this.state.width;
                                this.state.json.element.content = JSON.parse(JSON.stringify(this.state.content));
                                this.setState({height: 50, saveDialog: false, content: []})
                            }}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <SaveIcon/>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={'Salva Element'}/>
                            </ListItem>
                            <ListItem button onClick={() => {
                                this.state.json.footer.height = this.state.height;
                                this.state.json.width = this.state.width;
                                this.state.json.footer.content = JSON.parse(JSON.stringify(this.state.content));
                                this.setState({height: 50, saveDialog: false, content: []})
                            }}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <SaveIcon/>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={'Salva footer'}/>
                            </ListItem>
                            <ListItem button onClick={() => {
                                let w = window.open(null, '_blank', 'width=335,height=330,resizable=1');
                                this.state.json.kw = this.getKeywords()[0]
                                w.document.write(JSON.stringify(this.state.json));
                                this.setState({saveDialog: false})
                            }
                            }>
                                <ListItemAvatar>
                                    <Avatar>
                                        <SaveIcon/>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={'Esporta'}/>
                            </ListItem>
                        </List>
                    </div>
                </Dialog>}


            </div>);
    }

    foo = false;
}

export default withStyles(styles)(Editor)