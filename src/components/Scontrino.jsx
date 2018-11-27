import * as jsPDF from "jspdf"
import * as Base64 from "base-64"
import React from "react";
import qrc from 'qrious'
import Typography from "@material-ui/core/es/Typography/Typography";
import {GET, GETSync, POST} from "../network";
import {apiCalls} from "../consts";

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

    // model = {
    //     width: 80,
    //     headerh: 35,
    //     elemh: 6,
    //     footerh: 80,
    //     header: (doc) => {
    //         let image = "";
    //
    //         doc.addImage(image, 'PNG', 5, 6, 20, 20);
    //         write(doc, 'helvetica', 'bold', 24, 30, 20, "S.Lorenzo");
    //         write(doc, 'times', 'italic', 15, 55, 26, "Capriolo");
    //         doc.line(10, 32, 70, 32)
    //
    //     },
    //     element: (doc, y, qty, text, price) => {
    //         y += 4;
    //         write(doc, 'helvetica', 'normal', 11, 5, y, `${qty} ${text}`);
    //         write(doc, 'courier', 'normal', 11, 80 - (price.length + 1) * 3, y, `${price}E`)
    //     },
    //     footer: (doc, y, totale, contanti, resto, numOrdine, qr, buono) => {
    //         y += 15;
    //         doc.line(5, y-10, 75, y-10);
    //
    //         write(doc, 'helvetica', 'normal', 11, 80 - (buono.length + 1) * 4, y-2, `${buono}`);
    //
    //         write(doc, 'helvetica', 'bold', 20, 5, y+5, `TOTALE`);
    //         write(doc, 'courier', 'normal', 20, 80 - (totale.length + 1) * 5, y+5, `${totale}E`);
    //
    //         write(doc, 'helvetica', 'bold', 14, 5, y+6+5, `CONTANTI`);
    //         write(doc, 'courier', 'normal', 14, 80 - (contanti.length + 1) * 4, y+6+5, `${contanti}E`);
    //
    //         write(doc, 'helvetica', 'bold', 14, 5, y+11+5, `Resto`);
    //         write(doc, 'courier', 'normal', 14, 80 - (resto.length + 1) * 4, y+11+5, `${resto}E`);
    //
    //         doc.addImage(qr, 'PNG', 5, y + 20+5, 25, 25);
    //         write(doc, 'helvetica', 'bold', 40, 37, y+35+5, "" + numOrdine);
    //     }
    // };
    map = new Map();

    _createMap(kw) {
        Object.keys(kw).forEach(e => this.map.set(kw[e], this.props.kw[e] ? this.props.kw[e] : "NULL"))
    }

    _elem(element, e, offset=0) {
        Object.keys(e).forEach(q => {
            this.map.set(q, e[q]);
        });
        this._parse(element, offset)
    }

    _parse(element, offset=0) {
        for (let i = 0; i < element.length; i++) {
            let e = element[i];
            switch (e.type) {
                case "reference":
                    if(e.path === "null") break;
                    let obj = JSON.parse(GETSync(e.path));
                    obj.x += e.x;
                    obj.y += e.y;
                    element.push(obj);
                    break;
                case "image":
                    this.doc.addImage(e.data, e.format, e.x, e.y+offset, e.w, e.h);
                    break;
                case "text":
                    if (e.parse) this.map.forEach((v, k) => e.text = e.text.replace(k, v));
                    write(this.doc, e.font, e.variant, e.size, e.x, e.y+offset, e.text);
                    break;
                case "qr":
                    if (e.parse) this.map.forEach((v, k) => e.data = e.data.replace(k, v));
                    let elm = document.createElement("canvas");
                    let qr = new qrc({
                        element: elm,
                        value: e.data,
                        background: e.bg,
                        foreground: e.fg,
                        level: e.correction,
                        size: e.size
                    });
                    this.doc.addImage(elm.toDataURL(), "PNG", e.x, e.y+offset, Math.floor(e.size/3.77), Math.floor(e.size/3.77));
                    break;
                case "line":
                    this.doc.setLineWidth(e.width);
                    this.doc.line(e.coordsx[0], e.coordsy[0] + offset, e.coordsx[1] + offset, e.coordsy[1] + offset);
                    break;
                case "rect":
                    this.doc.setDrawColor(e.border[0], e.border[1], e.border[2]);
                    this.doc.setFillColor(e.fill[0], e.fill[1], e.fill[2]);
                    this.doc.roundedRect(e.x, e.y + offset, e.w, e.h, e.round, e.round, e.dofill ? 'FD' : 'D');
                    break;
                default:
                    console.error(`INEXISTENT ELEMENT ${e.type}`);
            }
        }

    }

    _generate(res){
        let height = res.header.height + res.element.height * this.props.elementi.length + res.footer.height;
        this.doc = new jsPDF({
            orientation: height > res.width ? 'portait' : 'landscape',
            unit: 'mm',
            format: [res.width, height]
        });
        this._createMap(res.kw);
        this._parse(res.header.content, 0);

        if(this.props.elementi !== undefined)
            this.props.elementi.forEach((e, i) => this._elem(res.element.content, e, res.header.height + i*res.element.height));

        this._parse(res.footer.content, res.header.height + res.element.height * this.props.elementi.length);

        this._data = <embed id="tobeprinted" width="100%" height="99%"
                            src={"data:application/pdf;base64," + Base64.encode(this.doc.output())}
                            type="application/pdf" internalinstanceid="12"/>
        this.forceUpdate()
    }

    createPaper() {
        if(this.props.path)
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
                this.props.kw.ordnum = res.ordnum.pad(4);
                this.props.kw.date  = Date.now();
                this.createPaper();
            });
        else {
            this.props.kw.ordnum  = this.props.ordnum;
            this.props.kw.date  = Date.now();
            this.createPaper();
        }
    }

    calling = true;

    componentDidUpdate(){
        if(this.calling) {
            this.createPaper();
            this.calling = false
        } else this.calling = true
    }

    render() {
        return this._data;
    }
}

export default Scontrino

