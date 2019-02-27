#!/bin/bash
echo "Deploying to $1";
uname -a;

if lsof -Pi :"$2" -sTCP:LISTEN -t >/dev/null ; then
    echo "Server was already running";
    npm install --prefix "$1/server/";
    npm run build --prefix  "$1/server/";
else
    echo "Server was has stopped, Restarting it...";
    npm install --prefix "$1/server/";
    npm run build --prefix  "$1/server/";
    date &>> "/tmp/running.txt";
    npm start --prefix "$1/server/" &>> "/tmp/running.txt" &
fi

echo "Done deploying to $1";