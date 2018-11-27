import React from "react";
import * as cfg from './network.config'

const connection_status = Object.freeze({
    guest: "guest",
    client: "client",
    noapi: "noapi"
});

const sagraName = "Sagra San Lorenzo";

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
    buono: "/api/buono"
};

const mqttServer = `ws://${cfg.serverIP}:${cfg.mqtt.broker.ws.port}`;
const loginLogo =
        <img src={"/logo/drawing.svg.png"} width="76px"/>;

const CategoryWidth = "25%";
const CategoryHeight = 200;

const ProductsWidth = {"360": 6, "768": 4, "1024": 3, "1920": 2, "over": 2}; //over 12 cols colspan
const productsHeight = 110;
const tileWidth = 270;

const Currency = "EUR";

const orderCifres = 4;

const scontrinoModel = "/TEMPLATES/scontrino.json";


export {orderCifres, mqttServer, connection_status, sagraName, apiCalls, loginLogo, CategoryWidth, CategoryHeight, ProductsWidth, Currency, productsHeight,tileWidth, scontrinoModel};
