// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
// ng build --configuration production

export const environment = {
  production: true,
  /*
   * Position URL absolue des fichiers requete de l'API
   */
  apiUrl: 'https://intra.actn.fr/backend/api',

  /* Url vers les APIs du front */
  apiUrlActn: 'https://alpha.actn.fr/backend/api',
  apiUrlActnHtml: 'https://alpha.actn.fr/CommunWeb/pageshtml',
  apiUrlActnIban: 'https://alpha.actn.fr/CommunWeb/iban',
  logoMarquesCouleurs200x80: 'https://alpha.actn.fr/CommunWeb/marque/200x80/COULEUR/',
  produitVirtuelDefautImgUrl: 'https://alpha.actn.fr/CommunWeb/photos/reel/produit-dft-virtuel.jpg',
  produitDefautImgUrl: 'https://alpha.actn.fr/CommunWeb/photos/reel/produit-dft.jpg',
  /*
   * URL du dossier 'backend', racine de multitude de fichiers nécéssaires au site
   */
  backend: 'https://intra.actn.fr/backend',

  /* URL qui pointe vers les images vignettes */
  vignette: 'https://alpha.actn.fr/CommunWeb/photos/vignettes/',

  /* Url qui pointe vers l'image de la marque */
  photoMarque: 'https://alpha.actn.fr/CommunWeb/marque/70x30center/',

  /* Urld qui pointe vers la photo du produit */
  photoReel: 'https://alpha.actn.fr/CommunWeb/photos/reel/',

  banniereUrl: 'https://alpha.actn.fr/CommunWeb/bannieres/',
  configurateurZyxel: 'https://alpha.actn.fr/CommunWeb/configurateur/ZYXEL/',
  configurateurSonicWall: 'https://alpha.actn.fr/CommunWeb/configurateur/SONICWALL/',
  daysLeftForCotationToBeCritical: 14,
  logoMarquesUrl70x30center: 'https://alpha.actn.fr/CommunWeb/marque/70x30center/',
  img: "https://alpha.actn.fr/CommunWeb/img/",
  produitPdfUrl: 'https://alpha.actn.fr/CommunWeb/pdf/',
  logoMarquesUrl70x30down: 'https://alpha.actn.fr/CommunWeb/marque/70x30/',
  aideRMAUrl: 'https://alpha.actn.fr/CommunWeb/aideRMA/',
  maxFranco: 99999,
  pagesHtml: 'https://alpha.actn.fr/CommunWeb/pageshtml/',
  logoMarquesUrl: 'https://alpha.actn.fr/CommunWeb/marque/',
  idAzure: '1a334d40-4b89-49f0-a2f0-ca0089485c57',
  urlAzure: 'https://intra.actn.fr'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
