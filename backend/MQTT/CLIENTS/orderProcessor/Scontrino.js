global.window = {document: {createElementNS: () => {return {}} }};
global.navigator = {};
global.btoa = () => {};
global.atob = () => {};

const {GETSync, GET} = require("./network");
const jsPDF = require("jspdf");
const cfg = require("../../../network.config");
const QRCode = require("qrcode");


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

class Scontrino {

    getDoc() {
        return this.doc;
    }

    constructor(path, kw, elements, ordnum, obj = null) {
        this.props = {};
        this.doc = null;
        this.map = new Map();
        this.kw = null;
        this.props.path = path;
        this.props.kw = kw;
        this.props.elementi = elements;
        this.props.ordnum = ordnum;
        this.props.object = obj;

        this.createPaper();
    }

    _createMap(kw) {
        this.kw = kw;
        Object.keys(kw).forEach(e => this.map.set(kw[e], this.props.kw[e] ? this.props.kw[e] : "NULL"))
    }

    _elem(element, e, offset = 0) {
        Object.keys(e).forEach(q => {
            this.map.set(this.kw[q], e[q]);
        });
        this._parse(element, offset)
    }

    _parse(element, offset = 0) {
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
                        write(this.doc, e.font, e.variant, e.size, e.x, e.y + offset, e.text);
                        break;
                    case "qr":
                        console.error("YOU CANT USE QR IN THIS")
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

    _generate(res) {
        let height = res.header.height + res.element.height * this.props.elementi.length + res.footer.height;
        this.doc = new jsPDF({
            orientation: height > res.width ? 'portait' : 'landscape',
            unit: 'mm',
            format: [res.width, height]
        });
        this._createMap(res.kw);
        this._parse(res.header.content, 0);

        if (this.props.elementi !== undefined)
            this.props.elementi.forEach((e, i) => this._elem(res.element.content, e, res.header.height + i * res.element.height));

        this._parse(res.footer.content, res.header.height + res.element.height * this.props.elementi.length);

    }

    createPaper() {
        if (this.props.path)
            GET(`https://${cfg.serverIP}:${cfg.serverPort}${this.props.path}`).then(res => {
                this._generate(res)
            });
        else this._generate(JSON.parse(JSON.stringify(this.props.object)))
    }

}

module.exports.Scontrino = Scontrino;

