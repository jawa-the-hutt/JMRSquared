#!/bin/bash
sshpass -p $1 rsync --progress -av --dry-run --update -e "ssh -p7822" ./* $0@$2:/home/mulavhe/www/JMRSquaredDev
sshpass -p $1 rsync --progress -av --update -e "ssh -p7822" ./* $0@$2:/home/mulavhe/www/JMRSquaredDev
sshpass -p $1 ssh $0@$2:/home/mulavhe/www/JMRSquaredDev/bash.sh -p 7822