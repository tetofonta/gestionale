#!/bin/bash

mkdir -p ./backend/sslcert
mkdir -p ./backend/MQTT/sslcert
mkdir -p ./backend/CAPTIVE/sslcert
mkdir -p ./backend/LOAD_BALANCER/sslcert
mkdir -p ./backend/dataManager/sslcert

openssl req -nodes -new -x509 -keyout ./backend/sslcert/server.key -out ./backend/sslcert/server.crt
ln -s "$PWD/backend/sslcert/server.key" backend/MQTT/sslcert/server.key
ln -s "$PWD/backend/sslcert/server.crt" backend/MQTT/sslcert/server.crt
ln -s "$PWD/backend/sslcert/server.key" backend/CAPTIVE/sslcert/server.key
ln -s "$PWD/backend/sslcert/server.crt" backend/CAPTIVE/sslcert/server.crt
ln -s "$PWD/backend/sslcert/server.key" backend/LOAD_BALANCER/sslcert/server.key
ln -s "$PWD/backend/sslcert/server.crt" backend/LOAD_BALANCER/sslcert/server.crt
ln -s "$PWD/backend/sslcert/server.key" backend/dataManager/sslcert/server.key
ln -s "$PWD/backend/sslcert/server.crt" backend/dataManager/sslcert/server.crt

if [ ! -f ./network.config.json ]; then
    cp ./network.config.json.TEMPLATE ./network.config.json
    nano ./network.config.json
fi

ln -s "$PWD/network.config.json" ./backend/
ln -s "$PWD/network.config.json" ./backend/MQTT/
ln -s "$PWD/network.config.json" ./backend/MQTT/CLIENTS/guestTracker/
ln -s "$PWD/network.config.json" ./backend/MQTT/CLIENTS/orderPrinter/
ln -s "$PWD/network.config.json" ./backend/MQTT/CLIENTS/orderProcessor//
ln -s "$PWD/network.config.json" ./backend/LOAD_BALANCER/
ln -s "$PWD/network.config.json" ./backend/CAPTIVE/
ln -s "$PWD/network.config.json" ./backend/dataManager/
ln -s "$PWD/network.config.json" ./src/configs/
ln -s "$PWD/backend/modules/built/api.json" ./src/configs/

yarn install
