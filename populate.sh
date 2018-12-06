#!/bin/bash

mkdir -p ./backend/sslcert
mkdir -p ./backend/MQTT/sslcert

openssl req -nodes -new -x509 -keyout ./backend/sslcert/server.key -out ./backend/sslcert/server.crt
cp backend/sslcert/* backend/MQTT/sslcert/

sudo apt install cups-bsd
yarn install