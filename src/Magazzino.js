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
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
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
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

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

class Magazzino extends React.Component {
    update = null;
    state = {
        current: 1,
        gruppi: [],
        details: [],
        productlist: [],
        openDeleteDialog: false,
        product: null,
        anchorEl: null,
        modify: false,
        detailsDisplay: [
            {
                value: true,
                label: 'Si'
            },
            {
                value: false,
                label: 'No'
            },
        ],
        detailsType: [
            {
                value: 'choose',
                label: 'Choose'
            },
            {
                value: 'select',
                label: 'Select'
            },
        ],
        detailsContent: ''
    };

    getDetailByJson(json) {
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

    getDetailById(id) {
        let label = "";

        this.state.details.forEach(detail => {
            if (detail.value === id) {
                label = detail.label;
                detail.used = true;
                detail.showButton = false;
            }
        });

        return label;
    }

    getGruppoById(id) {
        let label = "";

        this.state.gruppi.forEach(gruppo => {
            if (gruppo.value === id) {
                label = gruppo.label;
                gruppo.used = true;
                gruppo.showButton = false;
            }
        });

        return label;
    }

    getGreaterIdProdotto(plist) {
        let id = -1;

        plist.forEach(e => {
            if (e.id > id)
                id = e.id;
        });

        return id;
    }

    getGreaterIdGruppo() {
        let id = -1;

        this.state.gruppi.forEach(e => {
            if (e.value > id)
                id = e.value;
        });

        return id;
    }

    getGreaterIdDetails() {
        let id = -1;

        this.state.details.forEach(e => {
            if (e.value > id)
                id = e.value;
        });

        return id;
    }

    getItFromBoolean(bool) {
        if (bool === true)
            return 'Si';
        else if (bool === false)
            return 'No';
    }

    getRandomGroup() {
        let gruppo = {
            value: 0,
            label: 'Error'
        };

        this.state.gruppi.forEach(gruppo1 => {
            if (gruppo1.label === 'Bar')
                gruppo = gruppo1;
        });

        return gruppo;
    }

    getRandomDetails() {
        let detail = {
            value: 0,
            label: 'Error'
        };

        this.state.details.forEach(detail1 => {
            if (detail1.label === 'Nessuno')
                detail = detail1;
        });

        return detail;
    }

    componentDidMount() {
        this.state.gruppi = [];
        this.state.details = [];

        POST(apiCalls.getDetails, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                res.list.forEach(e => {
                    let json = JSON.parse(e.json);

                    this.state.details.push({
                        value: e.id,
                        label: this.getDetailByJson(json),
                        json: json,
                        used: false,
                        showButton: true,
                        display: json.display,
                        type: json.dialog ? (json.dialog.choose ? 'choose' : 'select') : ''
                    });
                });

                this.forceUpdate();
            } else console.log(res)
        }).then( () => POST(apiCalls.getGruppiCucina, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                res.list.forEach(e => {
                    this.state.gruppi.push({
                        value: e.id,
                        label: e.nome[0].toUpperCase() + e.nome.slice(1).toLowerCase(),
                        image: e.image,
                        used: false,
                        showButton: true
                    })
                });
                this.forceUpdate();
            } else console.log(res)
        }).then(() => POST(apiCalls.getProducts, {user: window.ctx.get("username"), token: window.ctx.get("token")}).then(res => {
            if (res.state) {
                let plist = [];

                Object.keys(res.list).forEach(e => {
                    res.list[e].detail = {
                        value: res.list[e].details,
                        label: this.getDetailById(res.list[e].details)
                    };

                    res.list[e].gruppo = {
                        value: res.list[e].gruppo,
                        label: this.getGruppoById(res.list[e].gruppo)
                    };

                    res.list[e].showDelete = true;

                    plist.push(res.list[e]);
                });

                this.setState({productlist: plist,
                    greaterIdProdotto: this.getGreaterIdProdotto(plist),
                    greaterIdGruppo: this.getGreaterIdGruppo(),
                    greaterIdDetails: this.getGreaterIdDetails(),
                    randomGruppo: this.getRandomGroup(),
                    randomDetail: this.getRandomDetails()
                });

            } else console.log(res);
        })));
    }

    render(start) {
        const {classes} = this.props;

        return (
            <div>
                <NavBar titleText={'Magazzino - ' + (this.state.current === 1 ? 'Prodotti' : (this.state.current === 2 ? 'Dettagli' : (this.state.current === 3 ? 'Gruppi' : '')))}
                        history={this.props.history} showHome={true}/>

                <Paper className={this.props.classes.marginTop}>
                    {this.state.current === 1 &&
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <CustomTableCell style={{fontSize: 25}}>Pietanza</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Descrizione</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Giacenza</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Costo</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Dettagli</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Gruppo</CustomTableCell>
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
                                            // this.state.productlist.push({
                                            //     id: this.state.greaterIdProdotto + 1,
                                            //     desc: "",
                                            //     details: 1,
                                            //     giacenza: 0,
                                            //     costo: 1,
                                            //     info: "",
                                            //     gruppo: this.state.randomGruppo,
                                            //     detail: this.state.randomDetail,
                                            //     edited: false,
                                            //     showDelete: false
                                            // });

                                            this.state.productlist.push(JSON.parse(JSON.stringify(this.state.productlist[this.state.productlist.length - 1])));
                                            this.state.productlist[this.state.productlist.length - 1].id = this.state.greaterIdProdotto + 1;
                                            this.state.productlist[this.state.productlist.length - 1].desc = 'Nuovo';
                                            this.state.productlist[this.state.productlist.length - 1].info = '';
                                            this.state.productlist[this.state.productlist.length - 1].costo = 1.00;

                                            this.state.greaterIdProdotto++;

                                            this.forceUpdate();
                                        }}>
                                        <AddIcon className={classes.whiteIcon}/>
                                    </Button>
                                        <Button
                                            className={classes.nomargin}
                                            onClick={e => {
                                                POST(apiCalls.updmagazzino, {
                                                    user: window.ctx.get("username"),
                                                    token: window.ctx.get("token"),
                                                    modified: this.state.productlist.filter(e => e.edited)
                                                }).then(e => {
                                                    this.componentDidMount();
                                                });

                                                this.state.modify = false;
                                                this.state.productlist.forEach(e => {
                                                    e.edited = false;
                                                });

                                                this.forceUpdate();
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
                                        <CustomTableCell>{e.info === 'NULL' ? '' : e.info}</CustomTableCell>
                                        <CustomTableCell>{e.giacenza}</CustomTableCell>
                                        <CustomTableCell>{e.costo.toFixed(2)}</CustomTableCell>
                                        <CustomTableCell>{e.detail.label}</CustomTableCell>
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
                                            <TextField placeholder={e.info === 'NULL' ? '' : e.info} onChange={e => {
                                                this.state.productlist[i].info = e.target.value;
                                                this.state.productlist[i].edited = true;

                                                if (this.update !== null)
                                                    clearTimeout(this.update);

                                                this.update = setTimeout(() => this.forceUpdate(), 1000);
                                            }}/>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <TextField placeholder={e.giacenza} onChange={e => {
                                                this.state.productlist[i].giacenza = e.target.value;
                                                this.state.productlist[i].edited = true;

                                                if (this.update !== null)
                                                    clearTimeout(this.update);

                                                this.update = setTimeout(() => this.forceUpdate(), 1000);
                                            }}/>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <TextField placeholder={!e.costo ? 1.00 : e.costo.toFixed(2)}
                                                       onChange={e => {
                                                           this.state.productlist[i].costo = isNaN(parseFloat(e.target.value)) ? 1.00 : parseFloat(e.target.value);
                                                           this.state.productlist[i].edited = true;

                                                           if (this.update !== null)
                                                               clearTimeout(this.update);

                                                           this.update = setTimeout(() => this.forceUpdate(), 1000);
                                                       }}/>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <FormControl className={classes.formControl}>
                                                <Select
                                                    value={JSON.stringify(this.state.productlist[i].detail.value)}
                                                    onChange={e => {
                                                        this.state.productlist[i].detail.value = e.target.value;
                                                        this.state.productlist[i].detail.label = this.getDetailById(e.target.value);
                                                        this.state.productlist[i].edited = true;

                                                        console.log(this.state.productlist)
                                                        console.log(this.state.details)

                                                        this.forceUpdate();
                                                    }}>
                                                    {this.state.details.map(option => (
                                                        <MenuItem value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText>Selezionare il dettaglio</FormHelperText>
                                            </FormControl>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <FormControl className={classes.formControl}>
                                                <Select
                                                    value={this.state.productlist[i].gruppo !== undefined ? this.state.productlist[i].gruppo.value : ""}
                                                    onChange={e => {
                                                        this.state.productlist[i].gruppo.value = e.target.value;
                                                        this.state.productlist[i].gruppo.label = this.getGruppoById(e.target.value);
                                                        this.state.productlist[i].edited = true;

                                                        console.log(i + "--->" + this.state.productlist.length)
                                                        console.log(this.state.productlist)

                                                        this.forceUpdate();
                                                    }}>
                                                    {this.state.gruppi.map(option => (
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
                                                <Button disabled={!e.showDelete}
                                                    onClick={() => {this.setState({openDeleteDialog: true, product: i});
                                                }}>
                                                    <DeleteIcon/>
                                                </Button>

                                                {this.state.productlist[i].edited &&
                                                <Button>
                                                    <EditIcon className={classes.redIcon}/>
                                                </Button>}
                                            </div>
                                        </CustomTableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>}
                    {this.state.current === 2 &&
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <CustomTableCell style={{fontSize: 25}}>Nome</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Visibilità</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Tipo</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Contenuto</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Utilizzato</CustomTableCell>
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
                                            this.state.details.push({
                                                display: true,
                                                edited: true,
                                                label: "Nuovo",
                                                showButton: false,
                                                type: "choose",
                                                used: false,
                                                value: this.state.greaterIdDetails + 1,
                                                json: {
                                                    dialog: {
                                                        choose: [
                                                            "Nuovo"
                                                        ]
                                                    },
                                                    display: true,
                                                    title: "Ancora alcuni dettagli..."
                                                }
                                            });

                                            this.state.greaterIdDetails++;
                                            this.forceUpdate();
                                        }}>
                                        <AddIcon className={classes.whiteIcon}/>
                                    </Button>
                                        <Button
                                            className={classes.nomargin}
                                            onClick={e => {
                                                this.state.details.map((e1, i) => {
                                                    console.log(e1)

                                                    if (e1.display) {
                                                        Object.keys(e1.json.dialog).map(e2 => {
                                                            e1.json.dialog[e2].map((e3, i1) => {
                                                                if (e3 === '')
                                                                    e1.json.dialog[e2].splice(i1, 1);
                                                            });
                                                        })
                                                    }

                                                    e1.showButton = !e1.used;
                                                    e1.json.display = e1.display;
                                                });

                                                POST(apiCalls.updDetails, {
                                                    user: window.ctx.get("username"),
                                                    token: window.ctx.get("token"),
                                                    modified: this.state.details.filter(e => e.edited)
                                                }).then(e => {
                                                    this.componentDidMount();
                                                });

                                                this.state.modify = false;
                                                this.state.details.forEach(e => {
                                                    e.edited = false;
                                                });

                                                this.forceUpdate();
                                            }}>
                                            <SaveIcon className={classes.whiteIcon}/>
                                        </Button>
                                    </div>}
                                </CustomTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!this.state.modify && this.state.details.map((e, i) => {
                                return (
                                    <TableRow className={classes.row}>
                                        <CustomTableCell>{e.label}</CustomTableCell>
                                        <CustomTableCell>{this.getItFromBoolean(e.json.display)}</CustomTableCell>
                                        <CustomTableCell>{e.json.display ? (e.json.dialog.choose ? 'Choose' : 'Select') : ''}</CustomTableCell>
                                        <CustomTableCell>
                                            {e.json.display &&
                                            <List style={{margin: 0, padding: 0}}>
                                                {Object.keys(e.json.dialog).map(e1 => {
                                                    return e.json.dialog[e1].map((e2) => {
                                                        return(
                                                            <ListItem style={{margin: 0, padding: 2}}>
                                                                <ListItemIcon>
                                                                    <ChevronRightIcon/>
                                                                </ListItemIcon>
                                                                <ListItemText>
                                                                    {e2.charAt(0).toUpperCase() + e2.slice(1)}
                                                                </ListItemText>
                                                            </ListItem>);
                                                    })
                                                })}
                                            </List>}
                                        </CustomTableCell>
                                        <CustomTableCell>{this.getItFromBoolean(e.used)}</CustomTableCell>
                                        <CustomTableCell>
                                            <Button disabled={!e.showButton} onClick={() => {
                                                this.setState({openDeleteDialog: true, detailToRemove: i});
                                            }}>
                                                <DeleteIcon/>
                                            </Button>
                                        </CustomTableCell>
                                    </TableRow>
                                );
                            })}
                            {this.state.modify && this.state.details.map((e, i) => {
                                return(
                                    <TableRow className={classes.row}>
                                        <CustomTableCell>{e.label}</CustomTableCell>
                                        <CustomTableCell>
                                            <FormControl className={classes.formControl}>
                                                <Select
                                                    value={this.state.details[i] ? this.state.details[i].display : ''}
                                                    onChange={e => {
                                                        this.state.details[i].display = e.target.value;
                                                        this.state.details[i].edited = true;

                                                        this.forceUpdate();
                                                    }}>
                                                    {this.state.detailsDisplay.map(option => (
                                                        <MenuItem value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText>Selezionare la visibilità</FormHelperText>
                                            </FormControl>
                                        </CustomTableCell>
                                        {this.state.details[i].display &&
                                        <CustomTableCell>
                                            <FormControl className={classes.formControl}>
                                                <Select
                                                    value={this.state.details[i] ? this.state.details[i].type : ''}
                                                    onChange={e => {
                                                        this.state.details[i].type = e.target.value;
                                                        this.state.details[i].edited = true;

                                                        this.forceUpdate();
                                                    }}>
                                                    {this.state.detailsType.map(option => (
                                                        <MenuItem value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <FormHelperText>Selezionare il tipo</FormHelperText>
                                            </FormControl>
                                        </CustomTableCell>}
                                        {this.state.details[i].display &&
                                        <CustomTableCell>
                                            {e.json.display &&
                                            <List style={{margin: 0, padding: 0}}>
                                                {Object.keys(e.json.dialog).map(e1 => {
                                                    return e.json.dialog[e1].map((e2, i1) => {
                                                        return(
                                                            <ListItem style={{margin: 0, padding: 2}}>
                                                                <ListItemIcon>
                                                                    <ChevronRightIcon/>
                                                                </ListItemIcon>
                                                                <ListItemText>
                                                                    <TextField placeholder={e2.charAt(0).toUpperCase() + e2.slice(1)} onChange={e3 => {
                                                                        (e.json.dialog[e1])[i1] = e3.target.value;
                                                                        this.state.details[i].edited = true;

                                                                        if (this.update !== null)
                                                                            clearTimeout(this.update);

                                                                        this.update = setTimeout(() => this.forceUpdate(), 1000);
                                                                    }}/>
                                                                </ListItemText>
                                                                {i1 === (e.json.dialog[e1].length - 1) &&
                                                                <Button onClick={() => {
                                                                    e.json.dialog[e1].push("");
                                                                    this.state.details[i].edited = true;

                                                                    this.forceUpdate();
                                                                }}>
                                                                    <AddIcon/>
                                                                </Button>}
                                                                <Button disabled={e.json.dialog[e1].length < 2} onClick={() => {
                                                                    e.json.dialog[e1].splice(i1, 1);
                                                                    this.state.details[i].edited = true;

                                                                    this.forceUpdate();
                                                                }}>
                                                                    <DeleteIcon/>
                                                                </Button>
                                                            </ListItem>);
                                                    })
                                                })}
                                            </List>}
                                        </CustomTableCell>}
                                        {!this.state.details[i].display &&
                                        <CustomTableCell/>}
                                        {!this.state.details[i].display &&
                                        <CustomTableCell/>}
                                        <CustomTableCell>{this.getItFromBoolean(e.used)}</CustomTableCell>
                                        <CustomTableCell>
                                            <div>
                                                <Button disabled={!e.showButton} onClick={() => {
                                                    this.setState({openDeleteDialog: true, detailToRemove: i});
                                                }}>
                                                    <DeleteIcon/>
                                                </Button>
                                                {this.state.details[i].edited &&
                                                <Button>
                                                    <EditIcon className={classes.redIcon}/>
                                                </Button>}
                                            </div>
                                        </CustomTableCell>
                                    </TableRow>
                                );})}
                        </TableBody>
                    </Table>}
                    {this.state.current === 3 &&
                    <Table className={classes.table}>
                        <TableHead>
                            <TableRow>
                                <CustomTableCell style={{fontSize: 25}}>Nome</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Immagine</CustomTableCell>
                                <CustomTableCell style={{fontSize: 25}}>Utilizzato</CustomTableCell>
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
                                            this.state.gruppi.push({
                                                value: this.state.greaterIdGruppo + 1,
                                                label: '',
                                                image: '/bg/food.jpg',
                                                used: false,
                                                showButton: false
                                            });

                                            this.state.greaterIdGruppo++;
                                            this.forceUpdate();
                                        }}>
                                        <AddIcon className={classes.whiteIcon}/>
                                    </Button>
                                        <Button
                                            className={classes.nomargin}
                                            onClick={e => {
                                                POST(apiCalls.updGruppiCucina, {
                                                    user: window.ctx.get("username"),
                                                    token: window.ctx.get("token"),
                                                    modified: this.state.gruppi.filter(e => e.edited)
                                                }).then(e =>
                                                    this.componentDidMount()
                                                );

                                                this.state.modify = false;
                                                this.state.productlist.forEach(e => {
                                                    e.edited = false;
                                                });

                                                this.forceUpdate();
                                            }}>
                                            <SaveIcon className={classes.whiteIcon}/>
                                        </Button>
                                    </div>}
                                </CustomTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {!this.state.modify && this.state.gruppi.map((e, i) => {
                                return (
                                    <TableRow className={classes.row}>
                                        <CustomTableCell>{e.label}</CustomTableCell>
                                        <CustomTableCell>{e.image}</CustomTableCell>
                                        <CustomTableCell>{this.getItFromBoolean(e.used)}</CustomTableCell>
                                        <CustomTableCell>
                                            <Button disabled={!e.showButton} onClick={() => {
                                                this.setState({openDeleteDialog: true, gruppoToRemove: i});
                                            }}>
                                                <DeleteIcon/>
                                            </Button>
                                        </CustomTableCell>
                                    </TableRow>
                                );
                            })}
                            {this.state.modify && this.state.gruppi.map((e, i) => {
                                return (
                                    <TableRow className={classes.row}>
                                        <CustomTableCell>
                                            <TextField placeholder={e.label} onChange={e => {
                                                this.state.gruppi[i].label = e.target.value;
                                                this.state.gruppi[i].edited = true;

                                                if (this.update !== null)
                                                    clearTimeout(this.update);

                                                setTimeout(() => this.forceUpdate(), 1000);
                                            }}/>
                                        </CustomTableCell>
                                        <CustomTableCell>
                                            <TextField placeholder={e.image} onChange={e => {
                                                this.state.gruppi[i].image = e.target.value;
                                                this.state.gruppi[i].edited = true;

                                                if (this.update !== null)
                                                    clearTimeout(this.update);

                                                setTimeout(() => this.forceUpdate(), 1000);
                                            }}/>
                                        </CustomTableCell>
                                        <CustomTableCell>{this.getItFromBoolean(e.used)}</CustomTableCell>
                                        <CustomTableCell>
                                            <div>
                                                <Button disabled={!e.showButton} onClick={() => {
                                                    this.setState({openDeleteDialog: true, gruppoToRemove: i});
                                                }}>
                                                    <DeleteIcon/>
                                                </Button>
                                                {this.state.gruppi[i].edited &&
                                                <Button>
                                                    <EditIcon className={classes.redIcon}/>
                                                </Button>}
                                            </div>
                                    </CustomTableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>}
                </Paper>
                {/*delete*/}
                {this.state.openDeleteDialog && <Dialog
                    open={this.state.openDeleteDialog}
                    onClose={() =>
                        this.setState({openDeleteDialog: false})
                    }>
                    <DialogTitle>
                        Sei sicuro di voler eliminare
                        "{
                        this.state.current === 1 ?
                            ((this.state.productlist[this.state.product]) ? this.state.productlist[this.state.product].desc.toLowerCase() : " ") :
                            this.state.current === 2 ?
                                ((this.state.details[this.state.detailToRemove]) ? this.state.details[this.state.detailToRemove].label.toLowerCase() : " ") :
                                this.state.current === 3 ?
                                    ((this.state.gruppi[this.state.gruppoToRemove]) ? this.state.gruppi[this.state.gruppoToRemove].label.toLowerCase() : " ") :
                                    " "
                        }"?
                    </DialogTitle>
                    <DialogActions>
                        <Button onClick={() => this.setState({openDeleteDialog: false})} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            if (this.state.current === 1){
                                POST(apiCalls.dltmagazzino, {
                                    user: window.ctx.get("username"),
                                    token: window.ctx.get("token"),
                                    modified: [this.state.productlist[this.state.product].id]
                                });
                                this.state.productlist.splice(this.state.product, 1);
                                this.state.product = null;
                            } else if (this.state.current === 2) {
                                POST(apiCalls.dltmagazzinopopups, {
                                    user: window.ctx.get("username"),
                                    token: window.ctx.get("token"),
                                    modified: [this.state.details[this.state.detailToRemove].value]
                                });
                                this.state.details.splice(this.state.detailToRemove, 1);
                                this.state.detailToRemove = null;
                            } else if (this.state.current === 3) {
                                POST(apiCalls.dltmagazzinogruppi, {
                                    user: window.ctx.get("username"),
                                    token: window.ctx.get("token"),
                                    modified: [this.state.gruppi[this.state.gruppoToRemove].value]
                                });
                                this.state.gruppi.splice(this.state.gruppoToRemove, 1);
                                this.state.gruppoToRemove = null;
                            }

                            this.state.openDeleteDialog = false;
                            this.forceUpdate();
                        }} color="primary" autoFocus>
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog> }
                {/*Menu*/}
                <Menu
                    id="menu"
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                    onClose={() => this.setState({anchorEl: null})}>
                    <MenuItem onClick={() => this.setState({anchorEl: null, current: 1})}>Gestione
                        prodotti</MenuItem>
                    <MenuItem onClick={() => this.setState({anchorEl: null, current: 2})}>Gestione
                        dettagli</MenuItem>
                    <MenuItem onClick={() => this.setState({anchorEl: null, current: 3})}>Gestione
                        gruppi</MenuItem>
                </Menu>
            </div>)
    }
}

let classe = withStyles(styles)(Magazzino);
export {classe}
export default withStyles(styles)(Magazzino);