#!/bin/bash
echo "Deploying to $1" &>> "/tmp/running-$2.txt";
uname -a;

if lsof -Pi :"$2" -sTCP:LISTEN -t >/dev/null ; then
    echo "Server was already running" &>> "/tmp/running-$2.txt";
    npm install --prefix "$1/server/";
    npm run build --prefix  "$1/server/";
else
    echo "Server was has stopped, Restarting it..." &>> "/tmp/running-$2.txt";
    npm install --prefix "$1/server/";
    npm run build --prefix  "$1/server/";
    date &>> "/tmp/running-$2.txt";
    npm start --prefix "$1/server/" &>> "/tmp/running-$2.txt";
fi

echo "Done deploying to $1" &>> "/tmp/running-$2.txt";