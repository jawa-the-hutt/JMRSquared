#!/bin/bash
export LC_ALL=C
echo "Deploying to $1";
uname -a;
npm install --prefix "$1/server/";
npm run build --prefix  "$1/server/";
fuser "$2/tcp" -k;
mongod --quiet --auth --config /etc/mongod.conf &
npm run play --prefix "$1/server/" &
echo "Done deploying to $1";