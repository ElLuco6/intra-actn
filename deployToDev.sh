# Variables
REMOTE_USER="Administrateur"
REMOTE_HOST="192.168.230.221"
REMOTE_DIR="C:/WWW-intra/"
LOCAL_DIR="./dist/intra-actn/*"

ng build --configuration development

ssh "$REMOTE_USER"@"$REMOTE_HOST" "cd '$REMOTE_DIR' && rm -r !(backend|.htaccess)"
# Transfert des fichiers en utilisant sshpass pour fournir le mot de passe
scp -r $LOCAL_DIR $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR
