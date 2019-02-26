#!/bin/bash
npm install --prefix ./server/
npm run build --prefix  ./server/
uname -a
fuser 3000/tcp -k
npm start --prefix ./server/ &
