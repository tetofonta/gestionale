#!/bin/bash

mkdir -p ./backend/sslcert
mkdir -p ./backend/MQTT/sslcert
mkdir -p ./backend/CAPTIVE/sslcert

openssl req -nodes -new -x509 -keyout ./backend/sslcert/server.key -out ./backend/sslcert/server.crt
ln -s "$PWD/backend/sslcert/server.key" backend/MQTT/sslcert/server.key
ln -s "$PWD/backend/sslcert/server.crt" backend/MQTT/sslcert/server.crt
ln -s "$PWD/backend/sslcert/server.key" backend/CAPTIVE/sslcert/server.key
ln -s "$PWD/backend/sslcert/server.crt" backend/CAPTIVE/sslcert/server.crt

if [ ! -f ./network.config.json ]; then
    cp ./network.config.json.TEMPLATE ./network.config.json
    nano ./network.config.json
fi

ln -s "$PWD/network.config.json" ./backend/
ln -s "$PWD/network.config.json" ./src/configs/

yarn install