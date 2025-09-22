# Variables
REMOTE_HOST="192.168.230.206"
REMOTE_USER="tpolo"
REMOTE_PATH="/var/www/intra.actn.fr/"
LOCAL_BUILD_PATH="./dist/intra-actn/*"
BACKUP_PATH="/var/www/intra.actn.fr-backup/"
# Construire l'application Angular
ng build --configuration production


ssh-copy-id $REMOTE_USER@$REMOTE_HOST

# Effectuer une sauvegarde des fichiers sur le serveur distant
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $BACKUP_PATH && cp -r $REMOTE_PATH* $BACKUP_PATH"

# Transférer le build vers le serveur distant via SSH
ssh -o BatchMode=yes $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && find $REMOTE_PATH -mindepth 1 ! \( -name .htaccess -o -path '*/backend/*' \) ! -path '*/backend' -delete"

# Copier les nouveaux fichiers vers le serveur distant
scp -r $LOCAL_BUILD_PATH $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH
