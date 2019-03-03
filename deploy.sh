#!/bin/bash
PASSWORD=$1;
PORT=$2;
USERNAME=$3;
ADDRESS=$4;
PROJECT_FOLDER=$5;
PROJECT_PORT=$6;
PROJECT_NAME=$7;
FILE_NAME="running-$6-$(date +"%F___%T").txt";

# Copy files to server
echo "Firing a build and deploy to $PROJECT_FOLDER" >> "/tmp/$FILE_NAME";
sshpass -p "$PASSWORD" rsync --progress -azvh --update --exclude='.git/' --filter=":- .gitignore" --exclude='.travis.yml' -e "ssh -p $PORT -oStrictHostKeyChecking=no" "./" "$USERNAME@$ADDRESS:$PROJECT_FOLDER/";

# Run build on server
sshpass -p "$PASSWORD" ssh -t -p "$PORT" -oStrictHostKeyChecking=no "$USERNAME@$ADDRESS" "bash -s" < ./build.sh "$PROJECT_FOLDER" "$PROJECT_NAME" "$FILE_NAME";