#!/bin/bash
PROJECT_PATH=$1;
PROJECT_NAME=$2;
LOG_FILE_NAME=$3;
echo "Deploying $PROJECT_NAME ..."
echo "Deploying $PROJECT_NAME..." >> "/tmp/$LOG_FILE_NAME";

npm install --prefix "$PROJECT_PATH/server/";
npm run build --prefix  "$PROJECT_PATH/server/";

echo "Deployed $PROJECT_NAME successfully!"
echo "Deployed $PROJECT_NAME successfully!" >> "/tmp/$LOG_FILE_NAME";