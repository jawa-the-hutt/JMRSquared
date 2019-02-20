#!/bin/bash
sshpass -p $1 rsync --progress -avrzP -e "ssh -p7822" ./server $0@$2:/home/mulavhe/www/JMRSquaredDev/server
sshpass -p $1 rsync --progress -avrzP -e "ssh -p7822" ./client $0@$2:/home/mulavhe/www/JMRSquaredDev/client