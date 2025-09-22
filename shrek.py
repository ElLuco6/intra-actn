import os
import random
from PIL import Image

# Chemin vers le répertoire contenant les images à remplacer
repertoire_images = '/chemin/vers/votre/repertoire'

# Chemin vers le répertoire contenant les images de Shrek
repertoire_shrek = '/chemin/vers/repertoire/shrek'

# Liste des fichiers dans le répertoire d'images
fichiers_images = [f for f in os.listdir(repertoire_images) if f.lower().endswith('.png')]

for fichier_image in fichiers_images:
    chemin_image_originale = os.path.join(repertoire_images, fichier_image)

    # Choisir une image de Shrek aléatoire
    shrek_images = [f for f in os.listdir(repertoire_shrek) if f.lower().endswith('.png')]
    shrek_image = Image.open(os.path.join(repertoire_shrek, random.choice(shrek_images)))

    # Ouvrir l'image originale
    image_originale = Image.open(chemin_image_originale)

    # Remplacer l'image originale par l'image de Shrek
    image_originale.paste(shrek_image, (0, 0), shrek_image)

    # Enregistrer l'image modifiée
    image_originale.save(chemin_image_originale)

print("Remplacement terminé.")
