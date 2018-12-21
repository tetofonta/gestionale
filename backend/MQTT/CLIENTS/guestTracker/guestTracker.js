const mqtt = require('mqtt');
const cfg = require("../../../network.config");
const {getConnection, secure} = require("../../../mysql");
const {logger_init} = require("../../../logger");
logger_init("./log/tracker.error.log", "./log/tracker.log");

let client = mqtt.connect(`mqtt://${cfg.MQTTIP}:${cfg.mqtt.broker.port}`);

client.on('connect', function () {
    client.subscribe(cfg.mqtt["order-guest"], err => {
        if (err) console.error(err)
    });
    client.subscribe(cfg.mqtt["order-listmsg"], err => {
        if (err) console.error(err)
    });
    if(process.argv[2] && process.argv[2] === "-worker-enable") {
        client.subscribe(cfg.mqtt["order-listch"], err => {
            if (err) console.error(err)
        });
        console.log("Worker is enabled");
    }
});

let clientid = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
let orders = {};
let lists = {};

function mergeLists(th){
    let i = lists[th];
    let newOrders = {};
    i.forEach(e => {
        Object.keys(e.list).forEach(q => newOrders[q] = e.list[q])
    });
    orders = JSON.parse(JSON.stringify(newOrders));
    client.publish(cfg.mqtt["order-listmsg"], JSON.stringify({action: "set", data: {orders: newOrders}}))
}

client.on('message', function (topic, message, packet) {
    switch (topic) {
        case cfg.mqtt["order-guest"]:
            let obj = JSON.parse(message.toString());
            if (Math.floor(Date.now() / 1000) - obj.time > cfg.guest.timeout) return;
            orders[obj.orderID] = obj;
            console.log(`Received object id ${obj.orderID}:\n ${message}`);
            break;
        case cfg.mqtt["order-listmsg"]:
            let objj = JSON.parse(message.toString());
            switch (objj.action){
                case "del":
                    objj = objj.data;
                    if (objj.host !== clientid){
                        orders[objj.order] = undefined;
                        console.log(`${objj.host} has deleted ${objj.orderID}`);
                    }
                    break;
                case "req":
                    client.publish(cfg.mqtt["order-listch"], JSON.stringify({list: orders, client: clientid, required: objj.client}));
                    console.log(`${objj.client} has requested`);
                    break;
            }
            break;
        case cfg.mqtt["order-listch"]:
            let ret = JSON.parse(message.toString());
            if(!lists[ret.required]){
                lists[ret.required] = [];
                setTimeout(() => mergeLists(ret.required), cfg.mqtt.listSendTimeout * 1000);
            }
            lists[ret.required].push(JSON.parse(message.toString()));
            console.log(`Received\n ${message}`);
            break;
    }
});
