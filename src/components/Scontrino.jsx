import * as jsPDF from "jspdf"
import * as Base64 from "base-64"
import React from "react";
import qrc from 'qrious'
import Typography from "@material-ui/core/es/Typography/Typography";
import {GET, GETSync, POST} from "../network";
import {apiCalls, orderCifres} from "../consts";
import Snackbar from "@material-ui/core/es/Snackbar/Snackbar";

Number.prototype.pad = function (size) {
    let s = String(this);
    while (s.length < (size || 2)) {
        s = "0" + s;
    }
    return s;
};

let write = (doc, font, variant, size, x, y, text) => {
    doc.setFont(font);
    doc.setFontSize(size);
    doc.setFontType(variant);
    doc.text(x, y, text);
};

class Scontrino extends React.Component {

    _data = <Typography variant="title">Caricamento...</Typography>;

    map = new Map();
    kw = null;
    calling = true;

    _createMap(kw) {
        this.kw = kw;
        Object.keys(kw).forEach(e => this.map.set(kw[e], this.props.kw[e] ? this.props.kw[e] : "NULL"))
    }

    _elem(element, e, offset = 0) {
        Object.keys(e).forEach(q => {
            this.map.set(this.kw[q], e[q]);
        });
        this._parse(JSON.parse(JSON.stringify(element)), offset)
    }

    _parse(element, offset = 0) {
        try {
            for (let i = 0; i < element.length; i++) {
                let e = element[i];
                switch (e.type) {
                    case "reference":
                        if (e.path === "null") break;
                        let obj = JSON.parse(GETSync(e.path));
                        obj.x += e.x;
                        obj.y += e.y;
                        element.push(obj);
                        break;
                    case "image":
                        this.doc.addImage(e.data, e.format, e.x, e.y + offset, e.w, e.h);
                        break;
                    case "text":
                        if (e.parse) this.map.forEach((v, k) => e.text = e.text.replace(k, v));
                        write(this.doc, e.font, e.variant, e.size, e.x, e.y + offset, JSON.parse(JSON.stringify(e.text)));
                        break;
                    case "qr":
                        if (e.parse) this.map.forEach((v, k) => e.data = e.data.replace(k, v));
                        let elm = document.createElement("canvas");
                        // noinspection JSPotentiallyInvalidConstructorUsage
                        let qr = new qrc({
                            element: elm,
                            value: e.data,
                            background: e.bg,
                            foreground: e.fg,
                            level: e.correction,
                            size: e.size
                        });
                        this.doc.addImage(elm.toDataURL(), "PNG", e.x, e.y + offset, Math.floor(e.size / 3.77), Math.floor(e.size / 3.77));
                        break;
                    case "line":
                        this.doc.setLineWidth(e.width);
                        this.doc.line(e.coordsx[0], e.coordsy[0] + offset, e.coordsx[1] + offset, e.coordsy[1] + offset);
                        break;
                    case "rect":
                        this.doc.setDrawColor(e.border[0], e.border[1], e.border[2], 0);
                        this.doc.setFillColor(e.fill[0], e.fill[1], e.fill[2], 0);
                        this.doc.roundedRect(e.x, e.y + offset, e.w, e.h, e.round, e.round, e.dofill ? 'FD' : 'D');
                        break;
                    default:
                        console.error(`INEXISTENT ELEMENT ${e.type}`);
                }
            }
        } catch (e) {
            this._data = <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={true}
                autoHideDuration={6000}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">{e}</span>}
                action={[]}
            />
        }
    }

    _page(page, elem) {
        this._parse(page.header.content, 0);

        if (elem !== undefined)
            elem.forEach((e, i) => this._elem(page.element.content, e, page.header.height + i * page.element.height));

        this._parse(page.footer.content, page.header.height + page.element.height * elem.length);
    }

    _generate(res) {
        let fullArr = [];
        console.log(this.props.elementi);
        Object.keys(this.props.elementi).forEach(e => {
            fullArr.push(...this.props.elementi[e])
        });

        let height = res.main.header.height + res.main.element.height * fullArr.length + res.main.footer.height;
        // noinspection JSPotentiallyInvalidConstructorUsage
        this.doc = new jsPDF({
            orientation: height > res.width ? 'portait' : 'landscape',
            unit: 'mm',
            format: [res.width, height]
        });
        this._createMap(res.kw);
        this._page(res.main, fullArr);

        Object.keys(this.props.elementi).forEach(e => {
            this.map.set(this.kw["category"], e);
            if (this.props.elementi[e].length > 0) {
                this.doc.addPage();
                this._page(res.details, this.props.elementi[e])
            }
        });

        this._data = <embed id="tobeprinted" width="100%" height="99%"
                            src={"data:application/pdf;base64," + Base64.encode(this.doc.output())}
                            type="application/pdf" internalinstanceid="12"/>;
        this.forceUpdate()
    }

    createPaper() {
        if (this.props.path)
            GET(this.props.path).then(res => {
                this._generate(res)
            });
        else this._generate(JSON.parse(JSON.stringify(this.props.object)))
    }

    componentDidMount() {
        if (this.props.kw.ordnum === null)
            POST(apiCalls.getOrdNum, {
                user: window.ctx.get("username"),
                token: window.ctx.get("token")
            }).then(res => {
                this.props.kw.ordnum = res.ordnum.pad(orderCifres);
                this.props.kw.date = Date.now();
                this.createPaper();
            });
        else {
            this.props.kw.date = Date.now();
            this.createPaper();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.calling) {
            this.createPaper();
            this.calling = false
        } else this.calling = true
    }

    render() {
        return this._data;
    }
}

export default Scontrino

