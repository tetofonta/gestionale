const mosca = require('mosca');
const {getNW_st} = require("../network");
const cfg = require("../network.config");
const {logger_init} = require("../logger");
logger_init("./log/broker.error.log", "./log/broker.log");

let restrictedTopics = [cfg.mqtt["order-official"]];

function nop() {
}

mosca.Server.prototype.publish = function publish(packet, client, callback) {

    try {
        if (restrictedTopics.includes(packet.topic))
            if (!getNW_st(client.connection.stream.socket._socket.remoteAddress)) {
                console.log("Denied connection from " + client.connection.stream.socket._socket.remoteAddress);
                return;
            }
        console.log(packet)
    } catch (e) {
        console.error(e)
    }


    const that = this;
    let logger = this.logger;

    if (typeof client === 'function') {
        callback = client;
        client = null;
    } else if (client) {
        logger = client.logger;
    }

    if (!callback) {
        callback = nop;
    }

    const newPacket = {
        topic: packet.topic,
        payload: packet.payload,
        messageId: this.generateUniqueId(),
        qos: packet.qos,
        retain: packet.retain
    };

    const opts = {
        qos: packet.qos,
        messageId: newPacket.messageId
    };

    if (client) {
        opts.clientId = client.id;
    }

    that.storePacket(newPacket, function () {
        if (that.closed) {
            logger.debug({packet: newPacket}, "not delivering because we are closed");
            return;
        }

        that.ascoltatore.publish(
            newPacket.topic,
            newPacket.payload,
            opts,
            function () {
                that.published(newPacket, client, function () {
                    if (newPacket.topic.indexOf('$SYS') >= 0) {
                        logger.trace({packet: newPacket}, "published packet");
                    } else {
                        logger.debug({packet: newPacket}, "published packet");
                    }
                    that.emit("published", newPacket, client);
                    callback(undefined, newPacket);
                });
            }
        );
    });
};

// let settings = {
//     http: {
//         port: cfg.mqtt.broker.ws.port,
//         bundle: true,
//         static: './',
//         host: cfg.mqtt.broker.ws.bind
//     },
//     port: cfg.mqtt.broker.port,
//     host: cfg.mqtt.broker.bind
// };

let settings = {
    interfaces: [
        {type: "mqtt", port: cfg.mqtt.broker.port},
        {
            type: "mqtts",
            port: cfg.mqtt.broker.secure,
            credentials: {keyPath: "./sslcert/server.key", certPath: "./sslcert/server.crt"}
        },
        {type: "http", port: cfg.mqtt.broker.ws.port, bundle: true},
        {
            type: "https",
            port: cfg.mqtt.broker.ws.secure,
            bundle: true,
            credentials: {keyPath: "./sslcert/server.key", certPath: "./sslcert/server.crt"}
        }
    ],
    secure: {keyPath: "./sslcert/server.key", certPath: "./sslcert/server.crt"},
    host: cfg.mqtt.broker.bind
};

let server = new mosca.Server(settings);

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
    console.log('Mosca server is up and running');
}
