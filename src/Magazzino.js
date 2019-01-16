import React from 'react'
import {withStyles} from '@material-ui/core/styles';
import NavBar from "./components/NavBar";
import Paper from "@material-ui/core/es/Paper/Paper";
import Button from "@material-ui/core/es/Button/Button";
import TextField from "@material-ui/core/es/TextField/TextField";
import AddIcon from "@material-ui/icons/Add"
import RemoveIcon from "@material-ui/icons/Remove"
import MenuItem from "@material-ui/core/es/MenuItem/MenuItem";
import {POST} from "./network";
import {apiCalls} from "./consts";
import Typography from "@material-ui/core/es/Typography/Typography";
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import Select from "@material-ui/core/Select/Select";
import FormControl from "@material-ui/core/FormControl/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText/FormHelperText";
import DeleteIcon from '@material-ui/icons/Delete';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Radio from "@material-ui/core/Radio/Radio";
import DialogContentText from "@material-ui/core/DialogContentText/DialogContentText";
import BottomNavigation from "@material-ui/core/BottomNavigation/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction/BottomNavigationAction";
import TableCell from "@material-ui/core/TableCell/TableCell";
import Table from "@material-ui/core/Table/Table";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import TableBody from "@material-ui/core/TableBody/TableBody";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from "@material-ui/core/Menu/Menu";

const styles = theme => ({
    marginTop: {
        marginTop: 68,
        height: "calc(100vh - 66px)",
        width: "100%",
        overflowY: "auto",
        zIndex: -2
    },
    cvs: {
        width: '100%',
        height: '100%',
        overflowX: 'hidden'
    },
    even: {
        backgroundColor: "#CCC"
    },
    margin: {
        margin: theme.spacing.unit,
    },
    marginLeft: {
        marginLeft: 3
    },
    foo: {},
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
    row: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
    whiteIcon: {
        color: theme.palette.common.white,
    },
    redIcon: {
        color: 'red',
    },
    nomargin: {
        margin: 0,
        padding: 0,
    },
    nomarginANDwidth: {
        width: 128,
    },
});

const CustomTableCell = withStyles(theme => ({
    head: {
        backgroundColor: '#333',
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

let gruppi = [];
let popups = [];

function getPopup(json) {
    let label = "";

    if (json.dialog) {
        if (json.dialog.choose)
            json.dialog.choose.forEach(ei => {
                label += (ei.charAt(0).toUpperCase() + ei.slice(1)) + " - ";
            });
        else if (json.dialog.select)
            json.dialog.select.forEach(ei => {
                label += (ei.charAt(0).toUpperCase() + ei.slice(1)) + " - ";
            });
    } else
        label += "Nessuno - ";

    label = label.slice(0, -3);
    return label;
}

class Magazzino extends React.Component {
    update = null;
    state = {
        gruppi: [],
        popups: [],
        list: [],
        productlist: [],
        productlistCpy: [],
        openDeleteDialog: false,
        openPopupDialog: false,
        openGruppoDialog: false,
        product: null,
        popupItems: [],
        buttonsPopup: ["Select", "Choose"],
        buttonsDisplay: ["Si", "No"],
        display: false,
        buttonsPopupSelected: [true, false],
        buttonsDisplaySelected: [false, true],
        okGroupDisabled: true,
        okPopDisabled: false,
        popNavValue: 'add',
        grpNavValue: 'add',
        anchorEl: null,
        modify: false,
    };

    componentDidMount() {
        gruppi = [];
        popups = [];

        POST(apiCalls.getPopups, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                res.list.forEach(e => {
                    popups.push({
                        value: JSON.parse(e.json),
                        label: getPopup(JSON.parse(e.json))
                    })
                });

                this.forceUpdate();
            } else console.log(res)
        });

        POST(apiCalls.getGruppiCucina, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                res.list.forEach(e => {
                    gruppi.push({
                        value: (e.nome.toLowerCase()),
                        label: (e.nome.charAt(0).toUpperCase() + e.nome.slice(1).toLowerCase())
                    })
                });
                this.forceUpdate();
            } else console.log(res)
        });

        POST(apiCalls.getProducts, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                let plist = [];

                Object.keys(res.list).forEach(e => {
                    res.list[e].popup = {
                        value: res.list[e].details,
                        label: getPopup(res.list[e].details)
                    };
                    res.list[e].gruppo = {
                        value: res.list[e].gnome.toLowerCase(),
                        label: (res.list[e].gnome.charAt(0).toUpperCase() + res.list[e].gnome.slice(1).toLowerCase())
                    };
                    plist.push(res.list[e]);
                });

                this.setState({productlist: plist, productlistCpy: JSON.parse(JSON.stringify(plist))});

                this.forceUpdate();
            } else console.log(res);
        });
    }

    render(start) {
        const {classes} = this.props;

        return (
            <div>
                <NavBar titleText='Magazzino' history={this.props.history} showHome={true}/>

                <Paper className={this.props.classes.marginTop}>
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <CustomTableCell>Pietanza</CustomTableCell>
                                <CustomTableCell>Descrizione</CustomTableCell>
                                <CustomTableCell numeric>Giacenza</CustomTableCell>
                                <CustomTableCell decimal>Costo</CustomTableCell>
                                <CustomTableCell>Popop</CustomTableCell>
                                <CustomTableCell>Gruppo</CustomTableCell>
                                <CustomTableCell className={classes.nomarginANDwidth} padding={'dense'}>
                                    {!this.state.modify &&
                                    <div className={classes.nomargin}>
                                        <Button
                                            className={classes.nomargin}
                                            onClick={e => this.setState({modify: true})}>
                                            <EditIcon className={classes.whiteIcon}/>
                                        </Button>
                                        <Button
                                            className={classes.nomargin}
                                            onClick={e => {
                                                this.setState({anchorEl: e.currentTarget})
                                            }}>
                                            <MenuIcon className={classes.whiteIcon}/>
                                        </Button>
                                    </div>}

                                    {this.state.modify &&
                                    <div className={classes.nomargin}><Button
                                        className={classes.nomargin}
                                        onClick={e => {
                                            this.state.productlist.splice(0, 0, "");
                                            this.forceUpdate();
                                        }}>
                                        <AddIcon className={classes.whiteIcon}/>
                                    </Button>
                                        <Button
                                            className={classes.nomargin}
                                            onClick={e => {
                                                this.state.modify = false;
                                                this.state.productlist.forEach(e => {
                                                    e.edited = false;
                                                });

                                                this.forceUpdate();

                                                // POST(apiCalls., {
                                                //     user: window.ctx.get("username"),
                                                //     token: window.ctx.get("token"),
                                                //     modified: this.state.productlist.filter(e => e.edited)
                                                // })
                                            }}>
                                            <SaveIcon className={classes.whiteIcon}/>
                                        </Button>
                                    </div>}
                                </CustomTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!this.state.modify && this.state.productlist.map((e, i) => {
                                return (
                                    <TableRow className={classes.row}>
                                        <CustomTableCell>{e.desc}</CustomTableCell>
                                        <CustomTableCell>{e.info}</CustomTableCell>
                                        <CustomTableCell numeric>{e.giacenza}</CustomTableCell>
                                        <CustomTableCell decimal>{e.costo.toFixed(2)}</CustomTableCell>
                                        <CustomTableCell>{e.popup.label}</CustomTableCell>
                                        <CustomTableCell>{e.gruppo.label}</CustomTableCell>
                                        <CustomTableCell>
                                            <Button onClick={() => {
                                                this.setState({openDeleteDialog: true, product: i});
                                            }}>
                                                <DeleteIcon/>
                                            </Button>
                                        </CustomTableCell>
                                    </TableRow>
                                );
                            })}
                            {this.state.modify && this.state.productlist.map((e, i) => {
                                return (
                                    <TableRow className={classes.row}>
                                        <CustomTableCell>
                                            <TextField placeholder={e.desc} onChange={e => {
                                                this.state.productlist[i].desc = e.target.value;
                                                this.state.productlist[i].edited = true;

                                                if (this.update !== null)
                                                    clearTimeout(this.update);

                                                setTimeout(() => this.forceUpdate(), 1000);
                                            }}/>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <TextField placeholder={e.info} onChange={e => {
                                                this.state.productlist[i].info = e.target.value;
                                                this.state.productlist[i].edited = true;

                                                console.log(this.state.productlistCpy);

                                                if (this.update !== null)
                                                    clearTimeout(this.update);

                                                this.update = setTimeout(() => this.forceUpdate(), 1000);
                                            }}/>
                                        </CustomTableCell>
                                        <CustomTableCell numeric>
                                            <TextField placeholder={e.giacenza} onChange={e => {
                                                this.state.productlist[i].giacenza = e.target.value;
                                                this.state.productlist[i].edited = true;

                                                if (this.update !== null)
                                                    clearTimeout(this.update);

                                                this.update = setTimeout(() => this.forceUpdate(), 1000);
                                            }}/>
                                        </CustomTableCell>
                                        <CustomTableCell decimal>
                                            <TextField placeholder={!e.costo ? 1.00 : e.costo.toFixed(2)}
                                                       onChange={e => {
                                                           this.state.productlist[i].eur = isNaN(parseFloat(e.target.value)) ? 1.00 : parseFloat(e.target.value);
                                                           this.state.productlist[i].edited = true;

                                                           if (this.update !== null)
                                                               clearTimeout(this.update);

                                                           this.update = setTimeout(() => this.forceUpdate(), 1000);
                                                       }}/>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <FormControl className={classes.formControl}>
                                                <Select
                                                    value={this.state.productlist[i].popup !== undefined ? JSON.stringify(this.state.productlist[i].popup.value) : "nessuno"}
                                                    onChange={e => {
                                                        this.state.productlist[i].popup.value = JSON.parse(e.target.value);
                                                        this.state.productlist[i].popup.label = getPopup(JSON.parse(e.target.value));

                                                        this.forceUpdate();
                                                    }}>
                                                    {popups.map(option => (
                                                        <MenuItem value={JSON.stringify(option.value)}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText>Selezionare il popup</FormHelperText>
                                            </FormControl>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <FormControl className={classes.formControl}>
                                                <Select
                                                    value={this.state.productlist[i] !== undefined ? this.state.productlist[i].gruppo.value : ""}
                                                    onChange={e => {
                                                        this.state.productlist[i].gruppo.value = e.target.value;
                                                        this.state.productlist[i].gruppo.label = e.target.value;
                                                        this.forceUpdate();
                                                    }}>
                                                    {gruppi.map(option => (
                                                        <MenuItem value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText>Selezionare il gruppo</FormHelperText>
                                            </FormControl>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <div>
                                                <Button onClick={() => {
                                                    this.setState({openDeleteDialog: true, product: i});
                                                }}>
                                                    <DeleteIcon/>
                                                </Button>

                                                {this.state.productlist[i].edited &&
                                                <Button onClick={e => {
                                                    this.state.productlist[i] = this.state.productlistCpy[i];
                                                    this.forceUpdate();
                                                }}>
                                                    <EditIcon className={classes.redIcon}/>
                                                </Button>}
                                            </div>
                                        </CustomTableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>
                {/*delete*/}
                {this.state.openDeleteDialog && <Dialog
                    open={this.state.openDeleteDialog}
                    onClose={() =>
                        this.setState({openDeleteDialog: false})
                    }>
                    <DialogTitle>
                        Sei sicuro di voler eliminare
                        "{(this.state.productlist[this.state.product]) ? this.state.productlist[this.state.product].desc.toLowerCase() : " "}"?
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={() => this.setState({openDeleteDialog: false})} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            this.state.openDeleteDialog = false;
                            this.state.productlist.splice(this.state.product, 1);
                            this.state.product = null;
                            this.forceUpdate();
                        }} color="primary" autoFocus>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog> }
                {/*popup*/}
                <Dialog
                    open={this.state.openPopupDialog}
                    onClose={() =>
                        this.setState({openPopupDialog: false})
                    }>
                    <DialogTitle>Gestione popup</DialogTitle>
                    <div style={{width: 350}}>
                        <div style={{marginLeft: 30}}>
                            <BottomNavigation value={this.state.popNavValue}
                                              onChange={(e, v) => {
                                                  this.setState({popNavValue: v, okPopDisabled: v === 'remove'})
                                              }}>
                                <BottomNavigationAction label="Aggiungi" value="add" icon={<AddIcon/>}/>
                                <BottomNavigationAction label="Rimuovi" value="remove" icon={<RemoveIcon/>}/>
                            </BottomNavigation>

                            {/*Aggiunta*/}
                            {this.state.popNavValue === 'add' &&
                            <div>
                                <DialogContentText>
                                    Selezionare la visibilità del popup:
                                </DialogContentText>
                                <DialogContent>
                                    {this.state.buttonsDisplay.map((e, i) => {
                                        return <FormControlLabel
                                            control={<Radio color="primary"/>}
                                            label={e}
                                            checked={this.state.buttonsDisplaySelected[i]}
                                            onChange={() => {
                                                let bdsCpy = this.state.buttonsDisplaySelected;
                                                this.state.buttonsDisplaySelected = [];
                                                bdsCpy.map((e1, i1) => this.state.buttonsDisplaySelected.push(i1 === i));

                                                this.state.display = e === "Si";

                                                this.forceUpdate();
                                            }}
                                        />
                                    })}
                                </DialogContent>

                                {this.state.display &&
                                <div>
                                    <DialogContentText>
                                        Selezionare la tipologia di popup:
                                    </DialogContentText>
                                    <DialogContent>
                                        {this.state.buttonsPopup.map((e, i) => {
                                            return <FormControlLabel
                                                control={<Radio color="primary"/>}
                                                label={e}
                                                checked={this.state.buttonsPopupSelected[i]}
                                                onChange={() => {
                                                    let bdsCpy = this.state.buttonsPopupSelected;
                                                    this.state.buttonsPopupSelected = [];
                                                    bdsCpy.map((e1, i1) => this.state.buttonsPopupSelected.push(i1 === i));

                                                    this.forceUpdate();
                                                }}
                                            />
                                        })}
                                    </DialogContent>
                                    <DialogContentText style={{maxWidth: 400, margin: 0}}>
                                        Indicare i nomi dei popup:
                                        <Button onClick={() => {
                                            this.state.popupItems.push("");
                                            this.forceUpdate();
                                        }}><AddIcon/></Button>
                                    </DialogContentText>
                                    <DialogContent>
                                        {this.state.popupItems.map((e, i) => {
                                            let rows =
                                                <div>
                                                    <Typography>
                                                        <TextField onChange={e => {
                                                            this.state.popupItems[i] = e.target.value;
                                                        }}/>
                                                        <Button onClick={() => {
                                                            this.state.popupItems.splice(i, 1);
                                                            this.forceUpdate();
                                                        }}><RemoveIcon/></Button>
                                                    </Typography>
                                                </div>;
                                            return <div> {rows} </div>;
                                        })}
                                    </DialogContent>
                                </div>}
                            </div>}
                            {/*Rimozione*/}
                            {this.state.popNavValue === 'remove' &&
                            <div>
                                {popups.map((e, i) => {
                                    let rows =
                                        <div>
                                            <Typography>
                                                <Button onClick={() => {
                                                    if (popups.length > 1) {
                                                        popups.splice(i, 1);
                                                        this.state.okPopDisabled = false;
                                                        this.forceUpdate();
                                                    }
                                                }}><DeleteIcon/></Button>
                                                {e.label}
                                            </Typography>
                                        </div>;
                                    return <div> {rows} </div>;
                                })}
                            </div>}
                        </div>
                    </div>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                this.state.openPopupDialog = false;
                                this.state.popupItems = [];
                                this.state.display = false;
                                this.state.buttonsDisplaySelected = [false, true];
                                this.state.buttonsPopupSelected = [true, false];

                                this.forceUpdate();
                            }} color="primary">
                            Cancel
                        </Button>
                        <Button
                            disabled={this.state.okPopDisabled}
                            onClick={() => {
                                let popupType = this.state.buttonsPopup[this.state.buttonsPopupSelected.findIndex(e => e === true)].toLowerCase();
                                let elements = '';

                                this.state.popupItems.forEach(e => {
                                    elements += '"' + e + '", ';
                                });

                                elements = elements.slice(0, -2);

                                let json = '{"display": ' + this.state.display;

                                if (this.state.display)
                                    json += ', "dialog": {"' + popupType + '": [' + elements + ']}, "title": "Ancora alcuni dettagli ..."';

                                json += '}';

                                this.state.openPopupDialog = false;
                                this.state.popupItems = [];
                                this.state.display = false;
                                this.state.buttonsDisplaySelected = [false, true];
                                this.state.buttonsPopupSelected = [true, false];

                                console.log(json);

                                this.forceUpdate();
                            }} color="primary" autoFocus>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
                {/*gruppo*/}
                <Dialog
                    open={this.state.openGruppoDialog}
                    onClose={() =>
                        this.setState({openGruppoDialog: false})
                    }>
                    <DialogTitle>Gestione gruppi</DialogTitle>
                    <div style={{width: 350}}>
                        <div style={{marginLeft: 30}}>
                            <BottomNavigation value={this.state.grpNavValue}
                                              onChange={(e, v) => this.setState({grpNavValue: v})}>
                                <BottomNavigationAction label="Aggiungi" value="add" icon={<AddIcon/>}/>
                                <BottomNavigationAction label="Rimuovi" value="remove" icon={<RemoveIcon/>}/>
                            </BottomNavigation>

                            {/*Aggiunta*/}
                            {this.state.grpNavValue === 'add' &&
                            <DialogContent>
                                <TextField placeholder={"Inserire il nome del gruppo"}
                                           onChange={e => {
                                               this.state.newGruppo = e.target.value;

                                               if (this.state.okGroupDisabled)
                                                   this.state.okGroupDisabled = false;

                                               if (this.update !== null)
                                                   clearTimeout(this.update);

                                               this.update = setTimeout(() => this.forceUpdate(), 500);
                                           }}/>
                            </DialogContent>}
                            {/*Rimozione*/}
                            {this.state.grpNavValue === 'remove' &&
                            <div>
                                {gruppi.map((e, i) => {
                                    let rows =
                                        <div>
                                            <Typography>
                                                <Button onClick={() => {
                                                    if (gruppi.length > 1) {
                                                        gruppi.splice(i, 1);
                                                        this.state.okGroupDisabled = false;
                                                        this.forceUpdate();
                                                    }
                                                }}><DeleteIcon/></Button>
                                                {e.label}
                                            </Typography>
                                        </div>;
                                    return <div> {rows} </div>;
                                })}
                            </div>}
                        </div>
                    </div>
                    <DialogActions>
                        <Button
                            onClick={() => this.setState({openGruppoDialog: false})} color="primary">
                            Cancel
                        </Button>
                        <Button
                            disabled={this.state.okGroupDisabled}
                            onClick={() => {
                                this.state.openGruppoDialog = false;

                                console.log(this.state.newGruppo);

                                this.forceUpdate();
                            }} color="primary" autoFocus>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
                {/*Menu*/}
                <Menu
                    id="menu"
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                    onClose={() => this.setState({anchorEl: null})}>
                    <MenuItem onClick={() => this.setState({anchorEl: null, openPopupDialog: true})}>Gestione
                        popup</MenuItem>
                    <MenuItem onClick={() => this.setState({anchorEl: null, openGruppoDialog: true})}>Gestione
                        Gruppi</MenuItem>
                </Menu>
            </div>)
    }
}

let classe = withStyles(styles)(Magazzino);
export {classe}
export default withStyles(styles)(Magazzino);