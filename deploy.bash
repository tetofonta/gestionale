#!/usr/bin/env bash

if [[ $# -eq 0 ]]; then
    echo "Uso: $ bash ./deploy.bash arch_list [server.crt server.key]"
    exit 0
fi

#build skeleton
mkdir -p output
rm -rf output/*
mkdir -p output/MQTT/broker/sslcert/
mkdir -p output/MQTT/orderPrinter/orders/
mkdir -p output/MQTT/guestTracker/
mkdir -p output/SERVER/sslcert
mkdir -p output/SERVER/static
mkdir -p output/MANAGER/sslcert
mkdir -p output/LOAD_BALANCER/sslcert
mkdir -p output/CAPTIVE/sslcert

#package MQTT apps
yarn pkg --targets "$1" --out-path output/MQTT/broker backend/MQTT/broker.js
yarn pkg --targets "$1" --out-path output/MQTT/orderPrinter backend/MQTT/CLIENTS/orderPrinter/orderPrinter.js
yarn pkg --targets "$1" --out-path output/MQTT/orderProcessor backend/MQTT/CLIENTS/orderProcessor/orderProcessor.js
yarn pkg --targets "$1" --out-path output/MQTT/guestTracker backend/MQTT/CLIENTS/guestTracker/guestTracker.js

#package express
yarn pkg --targets "$1" --out-path output/CAPTIVE backend/CAPTIVE/captive.js
yarn pkg -c init.json --targets "$1" --out-path output/SERVER backend/init.js
yarn pkg --targets "$1" --out-path output/MANAGER backend/dataManager/manager.js
yarn pkg --targets "$1" --out-path output/LOAD_BALANCER backend/LOAD_BALANCER/lb.js

#start yarn build
yarn build

cp -R build/* output/SERVER/static/
cp -R backend/static/* output/SERVER/static/


CERT="$2"
KEY="$3"
if [[ -z "$2" ]] || [[ -z "$3" ]]; then
    echo "No cert or key file supplied, generating selfsigned"
    openssl req -nodes -new -x509 -keyout ./output/server.key -out ./output/server.crt
    CERT="./output/server.crt"
    KEY="./output/server.key"
fi

cp "$CERT" ./output/SERVER/sslcert/server.crt
cp "$KEY" ./output/SERVER/sslcert/server.key

cp "$CERT" ./output/MQTT/broker/sslcert/server.crt
cp "$KEY" ./output/MQTT/broker/sslcert/server.key

cp "$CERT" ./output/LOAD_BALANCER/sslcert/server.crt
cp "$KEY" ./output/LOAD_BALANCER/sslcert/server.key

cp "$CERT" ./output/MANAGER/sslcert/server.crt
cp "$KEY" ./output/MANAGER/sslcert/server.key

cp "$CERT" ./output/CAPTIVE/sslcert/server.crt
cp "$KEY" ./output/CAPTIVE/sslcert/server.key

#remove junk
rm -rf ./build/

find output -name "*.map" -type f -delete
find output -name "*.md" -type f -delete
find output -name "*.txt" -type f -delete
find output -name "*.less" -type f -delete
find output -name "*.scss" -type f -delete
find output -name ".github" -exec rm -rf "{}" \;
find output -name "less" -exec rm -rf "{}" \;
find output -name "scss" -exec rm -rf "{}" \;
