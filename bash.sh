#!/bin/bash
npm install --prefix $0/server/
npm run build --prefix  $0/server/
uname -a
fuser $1/tcp -k
npm start --prefix $0/server/ &
