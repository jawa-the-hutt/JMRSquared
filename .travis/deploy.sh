#!/bin/bash
git config --global push.default simple # we only want to push one branch — master
# specify the repo on the live server as a remote repo, and name it 'production'
# <user> here is the separate user you created for deploying
git remote add production ssh://build@travis-ci.org@68.66.193.181:7822/home/mulavhe/www/JMRSqauredDev
git push production develop # push our updates