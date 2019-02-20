#!/bin/bash
sshpass -p $1 rsync --progress -avz -e ./ ssh -o StrictHostKeyChecking=no $0@$2:$3:/home/mulavhe/www/JMRSquaredDev