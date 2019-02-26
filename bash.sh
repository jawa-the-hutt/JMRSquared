#!/bin/bash
echo "Deploying to $0"
"uname -a"
npm install --prefix "$0/server/"
npm run build --prefix  "$0/server/"
fuser "$1/tcp" -k
npm start --prefix "$0/server/" &
