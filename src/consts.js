import React from "react";
import * as cfg from './configs/network.config'

const connection_status = Object.freeze({
    guest: "guest",
    client: "client",
    noapi: "noapi"
});

const sagraName = cfg.sagraName;

const apiCalls = {
    refresh: "/api/refresh",
    hello: "/api/hello",
    auth: "/api/auth",
    userList: "/api/userList",
    editUser: "/api/editUser",
    newUser: "/api/newUser",
    delUser: "/api/delUser",
    ads: "/api/ads",
    productList: "/api/products",
    getFncs: "/api/getfunctions",
    getOrdNum: "/api/new_order",
    buono: "/api/buono",
    buoni: "/api/buoni",
    updbuoni: "/api/updateBuoni",
    getGruppiCucina: "api/gruppiCucina",
    getPopups: "api/popups",
    getProducts: "api/getProducts",
    addMeals: "api/addMeals",
    getStorico: "/api/getStorico",
    ip: "/api/ip",
    getAllFncs: "/api/getAllFncs",
    getStats: "/api/getStats",
    getAds: "/api/getAds",
    editAds: "/api/editAds",
    delAds: "/api/delAds",
    getFeedback: "/api/getFeedback",
    sendFeed: "/api/sendFeed"
};

let mqttServer;
if (document.location.protocol === 'https:') mqttServer = `wss://${cfg.serverIP}:${cfg.mqtt.broker.ws.secure}`;
else mqttServer = `ws://${cfg.serverIP}:${cfg.mqtt.broker.ws.port}`;

const loginLogo =
    <img src={"/logo/drawing.svg.png"} width="76px"/>;

const CategoryWidth = cfg.react.categoryWidth;
const CategoryHeight = cfg.react.categoryHeight;

const ProductsWidth = cfg.react.productsWidth; //over 12 cols colspan
const productsHeight = cfg.react.productsHeight;
const tileWidth = cfg.react.tileWidth;

const Currency = cfg.react.currency;

const orderCifres = cfg.react.orderCifres;

const scontrinoModel = cfg.react.scontrino;

const categorieCucina = cfg.react.categorieCucina;


export {
    orderCifres,
    mqttServer,
    connection_status,
    sagraName,
    apiCalls,
    loginLogo,
    CategoryWidth,
    CategoryHeight,
    ProductsWidth,
    Currency,
    productsHeight,
    tileWidth,
    scontrinoModel,
    categorieCucina
};
