#!/bin/bash
sshpass -p $1 rsync --progress -avz ./ ssh $0@$2:$3/home/mulavhe/www/JMRSquaredDev