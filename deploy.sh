#!/usr/bin/env bash
buildTargets="node6-linux-x64"

#build skeleton
mkdir -p output
rm -rf output/*
mkdir -p output/MQTT/broker/log
mkdir -p output/MQTT/broker/sslcert
mkdir -p output/MQTT/orderPrinter/log
mkdir -p output/MQTT/orderPrinter/orders
mkdir -p output/MQTT/orderProcessor/log
mkdir -p output/MQTT/guestTracker/log
mkdir -p output/SERVER/log
mkdir -p output/SERVER/sslcert
mkdir -p output/SERVER/static


#package MQTT apps
yarn pkg --targets "$buildTargets" --out-path output/MQTT/broker backend/MQTT/broker.js
yarn pkg --targets "$buildTargets" --out-path output/MQTT/orderPrinter backend/MQTT/CLIENTS/orderPrinter/orderPrinter.js
yarn pkg --targets "$buildTargets" --out-path output/MQTT/orderProcessor backend/MQTT/CLIENTS/orderProcessor/orderProcessor.js
yarn pkg --targets "$buildTargets" --out-path output/MQTT/orderProcessor backend/MQTT/CLIENTS/guestTracker/guestTracker.js

#package express
yarn pkg --targets "$buildTargets" --out-path output/SERVER backend/init.js

#start yarn build
yarn build

cp -R build/* output/SERVER/static/
cp -R backend/static/* output/SERVER/static/
rm -rf output/*/.github/
rm -rf output/*.md
rm -rf output/*.txt
rm -rf output/*/less/
rm -rf output/*/scss/

openssl req -nodes -new -x509 -keyout output/SERVER/sslcert/server.key -out output/SERVER/sslcert/server.crt
cp output/SERVER/sslcert/* output/MQTT/broker/sslcert/

#remove junk
rm -rf ./build/

#copy launcher
cp run.sh output/run.sh