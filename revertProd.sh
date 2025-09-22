# Variables
REMOTE_HOST="192.168.230.206"
REMOTE_USER="tpolo"
REMOTE_PATH="/var/www/intra.actn.fr/"
BACKUP_PATH="/var/www/intra.actn.fr-backup/"

# Transférer le build vers le serveur distant via SSH
ssh -o BatchMode=yes $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && find $REMOTE_PATH -mindepth 1 ! \( -name .htaccess -o -path '*/backend/*' \) ! -path '*/backend' -delete"

ssh $REMOTE_USER@$REMOTE_HOST "cp -r $BACKUP_PATH/* $REMOTE_PATH"
