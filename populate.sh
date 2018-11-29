#!/bin/bash

mkdir -p ./backend/sslcert

openssl req -nodes -new -x509 -keyout ./backend/sslcert/server.key -out ./backend/sslcert/server.crt

sudo npm i mosca -g
yarn install