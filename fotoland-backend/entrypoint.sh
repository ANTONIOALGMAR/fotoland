#!/bin/sh
echo "--- Starting Application with IPv4 preference ---"
java -Djava.net.preferIPv4Stack=true -jar app.jar
