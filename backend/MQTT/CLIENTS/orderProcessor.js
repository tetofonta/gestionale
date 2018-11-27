let mqtt = require('mqtt');
const cfg = require("../../network.config");

let client = mqtt.connect(`mqtt://${cfg.serverIP}:${cfg.mqtt.broker.port}`);

client.on('connect', function () {
    client.subscribe('order/#', err => {
        if (err) {
            console.log(err)
        }
    })
});

client.on('message', function (topic, message, packet) {
    console.log(message.toString())
});

/*
{
  "cart": [
    [
      "Mora Polls",
      {
        "qta": 2,
        "eur": 10,
        "cents": 50
      }
    ],
    [
      "Bionda Pills",
      {
        "qta": 1,
        "eur": 10,
        "cents": 50
      }
    ],
    [
      "vino3",
      {
        "qta": 2,
        "eur": 10,
        "cents": 0
      }
    ],
    [
      "vino5",
      {
        "qta": 2,
        "eur": 10,
        "cents": 0
      }
    ],
    [
      "vino6",
      {
        "qta": 1,
        "eur": 10,
        "cents": 0
      }
    ],
    [
      "Sorbetto",
      {
        "qta": 2,
        "eur": 11,
        "cents": 5
      }
    ]
  ],
  "orderID": "ayapetodubo",
  "asporto": true,
  "message": "note",
  "ip": [],
  "user": "stefano",
  "time": 1543236530
}
*/