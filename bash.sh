#!/bin/bash
# mongod --quiet --auth --config /etc/mongod.conf
fuser 3000/tcp -k

npm install --prefix ./server/
npm run build --prefix  ./server/
npm start --prefix ./server/
