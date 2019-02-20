#!/bin/bash
sshpass -p $1 rsync --progress -avzP -e "ssh -p7822" ./ $0@$2:/home/mulavhe/www/JMRSquaredDev