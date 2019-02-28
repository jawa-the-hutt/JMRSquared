#!/bin/bash
$FILENAME = "running-$2-$(date).txt"
echo "Deploying to $1" >> "/tmp/$FILENAME";

if lsof -Pi :"$2" -sTCP:LISTEN -t >/dev/null ; then
    echo "Server was already up" >> "/tmp/$FILENAME";
    npm install --prefix "$1/server/";
    npm run build --prefix  "$1/server/";
else
    echo "Server was has stopped, Restarting it..." >> "/tmp/$FILENAME";
    npm install --prefix "$1/server/";
    npm run build --prefix  "$1/server/";
    npm start --prefix "$1/server/" >> "/tmp/$FILENAME";
fi

echo "Done deploying to $1" >> "/tmp/$FILENAME";