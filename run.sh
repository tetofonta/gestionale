#!/usr/bin/env bash
pwd=$PWD

cd ./MQTT/broker/ && ./broker$1 &
cd ${pwd}
cd ./MQTT/orderPrinter/ && ./orderPrinter$1 &
cd ${pwd}
cd ./MQTT/orderProcessor/ && ./orderProcessor$1 &
cd ${pwd}
cd ./MQTT/guestTracker/ && ./guestTracker$1 &
cd ${pwd}
cd ./MQTT/guestTracker/ && ./guestTracker$1 -worker-enable &
cd ${pwd}
cd ./SERVER/ && ./init$1 &
cd ${pwd}

echo "all running"