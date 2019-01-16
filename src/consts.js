import React from "react";
import * as cfg from './configs/network.config'
import * as api from './configs/api'

const connection_status = Object.freeze({
    guest: "guest",
    client: "client",
    noapi: "noapi"
});

const sagraName = cfg.sagraName;

const apiCalls = {};
Object.keys(api.apicalls).forEach(e => apiCalls[e] = api.apicalls[e].url);

let mqttServer;
if (document.location.protocol === 'https:') mqttServer = `wss://${cfg.MQTTIP}:${cfg.mqtt.broker.ws.secure}`;
else mqttServer = `ws://${cfg.MQTTIP}:${cfg.mqtt.broker.ws.port}`;

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
