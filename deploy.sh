sshpass -p $0 ssh -p$1 $2@$3 "uname -a"
sshpass -p $0 rsync -rav -e ssh --exclude='.git/' --exclude=scripts/ --exclude='.travis.yml' --delete-excluded ./ $2@$3:$4