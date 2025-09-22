import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {take} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {ProduitService} from "@services/produit.service";
import {PageEvent} from "@angular/material/paginator";
import {RmaService} from "@services/rma.service";
import {CartService} from "@services/cart.service";
import {environment} from "@env/environment";
import {CommandesService} from "@services/commandes.service";
import {LogClientService} from "@services/log-client.service";
import {faFilePdf, faMinusCircle, faPlusCircle, faTruck} from "@fortawesome/free-solid-svg-icons";
import {LocalStorageService} from "@services/local-storage.service";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-commandes',
  templateUrl: './commandes.component.html',
  styleUrls: ['./commandes.component.scss']
})
export class CommandesComponent implements OnInit, OnDestroy {

  @Input() numClient: number = 0;
  quant: number;
  /** Est-ce que la page charge encore ? */
  loading: boolean = true;
  /** Type de page de commande */
  page: string = '';

  commandes$: Subscription;

  /** Valeurs des entetes de commandes */
  cmd;
  /** Tableau non filtré de toutes les commandes formatée en donnée parcourable dans des boucles d'affichage */
  untouchedFormatCmd = [];
  /** Tableau filtrés toutes les commandes formatée en donnée parcourable dans des boucles d'affichage*/
  formatCmd = [];
  /** Tableau des status de commandes
   * Array( NumeroDeLivraison => Status ) */
  statutCmd = [];

  /** Observable des détails de commandes */
  cmdDetail$ = null;
  /** Valeur des détails de commandes */
  cmdDetails;

  /** Observable des détails de commandes */
  cmdNumSerie$ = null;
  /** Valeur des détails de commandes */
  cmdNumSeries: any[];

  numColi$ = null;
  numColis = [];
  cmdNumColis = [];
  sortedNumColis = new Map<string, any>();
  /** Est-ce qu'une popup est affichée ? */
  isPopUp = false;
  produitActif: { quantite: any; noserie?: any; };
  produitsList: any[];
  serieList = [];
  valid = false;
  listOK = false;

  /** Liste des commandes déroulées / à afficher */
  display = [];
  /** Ligne de texte d'aide pour produit non valide
   * Récupérée depuis un fichier texte distant */
  aideProduitNonValide: string;
  /** Texte d'explication de l'indisponibilité de la facture */
  explicationPDFFactureindispo = "Le fichier PDF associé à cette facture est momentanément indisponible.";
  /** Texte d'explication de l'indisponibilité du BL */
  explicationPDFBLindispo = "Le fichier PDF associé à ce bon de livraison est momentanément indisponible.";

  selectedTri: [string, string] = ['', ''];
  filtres = new Map<string, string | Array<string>>();
  /** Set<string> des status de commandes */
  statutSet = new Set<string>();
  /** Set<string> des marques */
  protected marqueSet = new Set<string>();
  /** Tableau de toutes les marques de produits des commandes
   * Fait depuis 'marqueSet' */
  marqueArray: Array<string> = [];

  /** Target of the last search, security measure to prevent jumping over search fields */
  currentSearchTarget: string = "";
  /** The ID of the setTimeout of the current search, may already be over. */
  currentSearchId: any;
  /** Amount of milisecond to wait with no input to start a search */
  searchMiliDelay: number = 700;

  // MatPaginator Inputs
  /** Nombre d'éléments affichés par page */
  pageSize = 50;
  /** Options d'affichage de la page */
  pageSizeOptions: number[] = [30, 50, 100];
  /** Index de la page affichée */
  pageIndex = 0;

  // MatPaginator Output
  pageEvent: PageEvent;

  protected environment = environment;

  constructor(
    private http: HttpClient,
    private commandesService: CommandesService,
    private produitService: ProduitService,
    private rmaService: RmaService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    public authClient: LogClientService,
    private storageService: LocalStorageService
  ) { }

  ngOnInit(): void
  {
    if(this.router.url == '/espace-client/commandes'){
      setTimeout(() => {
        try {
          const data = JSON.parse(this.storageService.getItem('client'));
          this.numClient = Number(data.id);
        } catch (error) {
          console.error('Erreur lors du parsing JSON :', error);
        }
      }, 50)
    }

    this.getServerData(null);
    this.filtres.set('marque', []);

    if (this.route.snapshot.routeConfig.path.includes('retours')) {
      this.page = 'rma';
    } else {
      this.page = 'commande';
    }
    this.quant = 1;
    this.rmaService.chargerAideProduitNonValide().subscribe(data => { this.aideProduitNonValide = data; });

   setTimeout(() => {
     this.getCommandesEntetesRequest(() => {
       this.formatCommand();
     });

     this.numSerieRequest();
     this.onTri('Date');
   }, 100)
  }
  /** Fonction de nettoyage, se lance à la destruction du composant */
  ngOnDestroy() {

    if (this.cmdDetail$ != null) {
      this.cmdDetail$.unsubscribe();
    }
    if (this.numColi$ != null) {
      this.numColi$.unsubscribe();
    }
    if (this.cmdNumSerie$ != null) {
      this.cmdNumSerie$.unsubscribe();
    }
    // this.cmdNumSerie$.unsubscribe();
  }

  getCommandesEntetesRequest = (callback) => {
    this.commandes$ = this.commandesService.getCommandes(this.numClient)
      .subscribe(
        (c) => {
          this.cmd = c;
          callback();
        },
        (error) => {
          console.warn('Erreur dans la requete PHP \'\' :', error);
        }
      );
  }

  formatCommand() {
    this.formatCmd = [];

    // Trier les commandes par numéro de commande
    this.cmd.sort((a: { numcommande: number; }, b: { numcommande: number; }) => a.numcommande - b.numcommande);

    // Grouper les commandes par numéro de commande
    const groupedCmd = this.cmd.reduce((acc: { [x: string]: any[]; }, cmd: { numcommande: string | number; }) => {
      acc[cmd.numcommande] = acc[cmd.numcommande] || [];
      acc[cmd.numcommande].push(cmd);
      return acc;
    }, {});

    // Transformer l'objet en tableau
    this.formatCmd = Object.values(groupedCmd);

    // Copier formatCmd dans untouchedFormatCmd
    this.untouchedFormatCmd = this.formatCmd;

    // Mettre à jour l'affichage
    this.setDisplay();

    // Effectuer des opérations asynchrones
    setTimeout(() => {
      this.cmdDetail$ = this.commandeDetailRequest().subscribe((ret) => {
        this.cmdDetails = ret;
        this.untouchedFormatCmd.forEach(commande => {
          commande.forEach((livraison: { statut: string; numcommande: any; numbl: any; }) => {
            this.statutSet.add(livraison.statut);
            this.getDetailsFromCommande(livraison.numcommande, livraison.numbl).forEach((details: { [x: string]: string; }) => {
              if (details['marque'] != "") {
                this.marqueSet.add(details['marque']);
              }
            });
          });
        });
        this.marqueArray = Array.from(this.marqueSet).sort();
      });

      this.getNumColisRequest(() => {
        this.formatColis();
      });
    }, 0);
    this.onTri('Date');
  }


  setDisplay() {
    for (let j = this.formatCmd.length - 1; j >= 0; j--) {
      this.display[String(this.formatCmd[j][0].numcommande)] = false;
    }
  }

  numSerieRequest() {
    this.cmdNumSerie$ = this.http
      .get<any>(`${environment.apiUrl}/CommandesNumSerie.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          client: this.numClient
        }
      })/*)*/;
    this.cmdNumSerie$ = this.cmdNumSerie$.subscribe((ret: any) => {
      this.cmdNumSeries = ret;
    });
  }

  commandeDetailRequest() {
    return (
      this.http.get(`${environment.apiUrl}/CommandesDetail.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          client: this.numClient
        }
      })
    );
  }

  getNumColisRequest(callback: { (): void; (): void; }) {
    /* Observable */
    this.numColi$ = this.http
      .get<any>(`${environment.apiUrl}/CommandesTrackingColis.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          commande: '0',
          bl: '0',
          client: this.numClient
        }
      });
    /* Subscribe */
    this.numColi$ = this.numColi$.subscribe((ret: any[]) => {
      /* Stockage des numéros de Colis */
      this.numColis = ret;

      /* FORMATAGE */
      callback();
    });
  }
  /** Vide this.numColis[] et le trie dans this.cmdNumColis[numcommande] */
  formatColis() {
    let cmdNumColis = {};
    let sortedNumColis = new Map();

    // Regrouper les colis par commande
    for (let colis of this.numColis) {
      let commande = colis.commande;
      if (!cmdNumColis[commande]) {
        cmdNumColis[commande] = [];
      }
      cmdNumColis[commande].push(colis);
    }

    // Regrouper les colis par BL pour chaque commande
    for (let commande in cmdNumColis) {
      let colis = cmdNumColis[commande];
      let blBuffer = new Map();

      for (let col of colis) {
        let bl = col.bl;
        if (!blBuffer.has(bl)) {
          blBuffer.set(bl, []);
        }
        blBuffer.get(bl).push(col);
      }

      sortedNumColis.set(commande, blBuffer);
    }

    // Convertir cmdNumColis en tableau
    let cmdNumColisArray = [];
    for (let commande in cmdNumColis) {
      cmdNumColisArray.push({
        commande: commande,
        colis: cmdNumColis[commande]
      });
    }

    this.cmdNumColis = cmdNumColisArray;
    this.sortedNumColis = sortedNumColis;
  }






  livraisonSerials(livraison: { numbp: any; }) {
    let ret = this.cmdNumSeries.filter((serial: { bp: any; }) => {
      return (serial.bp == livraison.numbp);
    });

    return (ret);
  }
  produitSerials(serials: any[], produit: { produit: any; }) {
    let ret = serials.filter((serial) => {
      return (serial.produit == produit.produit);
    });

    return (ret);
  }

  unrollCommandDetails(commandes: { numcommande: string | number; }[]) {
    this.produitsList = this.rmaService.getProduitList();
    this.listOK = true;
    /* IF commande hidden */
    this.display[commandes[0].numcommande] = this.display[commandes[0].numcommande] == false;
  }

  getDetailsFromCommande = (numcommande, numbl) => {
    return this.cmdDetails.filter(
      (entry: { numcommande: any; numbl: any; }) => {
        return ((entry.numcommande == numcommande) && (entry.numbl == numbl));
      }
    );
  }

  reOrderPreviousCommand(livraisons: { numcommande: any; numbl: any; }[])
  {
    let produits: Array<any>;

    const commande: Array<{ prod: string, quantitecommande: number }> = [];

    livraisons.forEach(
      (livraison: { numcommande: any; numbl: any; }) =>
      {
        produits = this.cmdDetails.filter((entry: { numcommande: any; numbl: any; }) => { return ((entry.numcommande == livraison.numcommande) && (entry.numbl == livraison.numbl)); });

        produits.forEach(
          (produit) => commande.push(
            { prod: produit.produit, quantitecommande: produit.quantite }
          )
        );
      }
    );

    this.cartService.addSavedCart(commande);
  }

  /**
   * Revois le lien de la fiche du produit à partir de sa/son seul(e) reference/ID :string
   */
  linkToProduct(produitId: string) {
    this.produitService.getProduitById(produitId)
      .pipe(take(1))
      .subscribe(
        (ret) => {
          this.router.navigateByUrl(
            String(this.produitService.lienProduit(ret))
              .replace(/,/g, "/")
          );
        }
      );
  }

  addProduitToCart(produit)
  {
    this.cartService.addSavedCart(
      [{
        prod: produit.produit,
        quantitecommande: 1
      }]
    );
  }

  popupDisplay(produit) {
    let tempList: string | any[];
    this.serieList = [];
    this.valid = false;
    tempList = this.produitsList.filter((element: { numcommande: any; numbl: any; produit: any; }) => element.numcommande === produit.numcommande && element.numbl === produit.numbl && element.produit === produit.produit);
    if (tempList.length === 1) {
      this.isPopUp = true;
      this.produitActif = tempList[0];
      this.quant = this.produitActif.quantite;
      if (this.produitActif.quantite === '1' && this.isValid(this.produitActif)) {
        if (this.produitActif.noserie) {
          this.serieList.push(this.produitActif.noserie);
        }
        this.valid = true;
        this.selectProduit(this.produitActif);
      } else {
        if (this.route.snapshot.data['filDArianne'][0].url === 'retours') {
          this.rmaService.isPopUp();
        }
      }
    }
  }

  isValid(produit: any): boolean {
    let tempList: string | any[];
    let prod: { autorma: string; };
    tempList = this.produitsList.filter((element: { numcommande: any; numbl: any; produit: any; }) => element.numcommande === produit.numcommande && element.numbl === produit.numbl && element.produit === produit.produit);
    if (tempList.length === 1) {
      prod = tempList[0];
      return (prod.autorma === 'O');
    } else {
      return false;
    }
  }

  close() {
    this.isPopUp = false;
    this.serieList = [];
    this.valid = false;
    if (this.route.snapshot.data['filDArianne'][0].url === 'retours') {
      this.rmaService.isNotPopUp();
    }
  }

  chargerAideProduitNonValide(): string {
    return this.aideProduitNonValide;
  }

  selectionSerie(serie) {
    if (this.serieList.includes(serie)) {
      const index = this.serieList.indexOf(serie);
      if (index > -1) {
        this.serieList.splice(index, 1);
        this.quant = 1;
        this.valid = this.serieList.length !== 0;
      }
    } else {
      this.serieList.push(serie);
      this.quant = 1;
      this.valid = true;

    }
  }

  // vérifie que le produit peut être encore retourné
  valideRMA(produit: any): boolean {
    return (produit.autorma === 'O');
  }

  quantChange(event: string) {
    this.quant = parseInt(event);
  }

  selectProduit(produit: { quantite: number; }, valid?: undefined) {
    if (valid) {
      this.valid = true;
    }
    if (this.valideRMA(produit)) {
      if (produit.quantite >= this.serieList.length && produit.quantite >= this.quant && this.valid) {
        this.rmaService.setProduit(produit, this.serieList, this.quant);
        this.rmaService.isNotPopUp();
        this.router.navigate(['/espace-client/confirmation-retour']);
      }
    } else {
      this.isPopUp = false;
      this.rmaService.isNotPopUp();
    }
  }

  selected(s: string): string {
    return this.selectedTri[0] === s ? this.selectedTri[1] : 'off';
  }

  /**
   * Déclenche le tri des éléments quand un des éléments du bandeau est cliqué.
   * @param s L'élément du bandeau qui a été cliqué
   */
  onTri(s: string): void {
    if (s === this.selectedTri[0]) {
      switch (this.selectedTri[1]) {
        case 'off':
          this.selectedTri[1] = 'asc';
          break;
        case 'asc':
          this.selectedTri[1] = 'desc';
          break;
        case 'desc':
          this.selectedTri[1] = 'asc';
          break;
        default:
          this.selectedTri[1] = 'off';
          break;
      }
    } else {
      this.selectedTri[0] = s;
      this.selectedTri[1] = 'asc';
    }
    this.trierLivraisons(this.formatCmd);
  }

  /**
   * Trie les commandes selon l'état du bandeau.
   */
  trierLivraisons(livraisons: Array<any>): Array<any> {
    switch (this.selectedTri[0]) {
      case 'Réf. client':
        livraisons = this.tri(livraisons, 'referencecommande');
        break;
      case 'Réf. ACTN':
        livraisons = this.tri(livraisons, 'numcommande');
        break;
      case 'Date':
        livraisons = this.tri(livraisons, 'datecommande');
        break;
      case 'Factures':
        livraisons = this.tri(livraisons, 'numfacture');
        break;
      case 'Dates Fact.':
        livraisons = this.tri(livraisons, 'datefacture');
        break;
      case 'Statut':
        livraisons = this.tri(livraisons, 'statut');
        break;
    }
    this.formatCmd = livraisons;
    return livraisons;
  }

  /**
   * Tri les livraison selon un attribut
   * @param livraisons La liste des livraisons à trier
   * @param target L'attribut sur lequel on veut trier
   */
  tri(livraisons: Array<any>, target: string): Array<any> {
    if (livraisons.length <= 1) {
      return livraisons;
    }
    else if (typeof livraisons[0][0][target] === 'string') {
      switch (this.selectedTri[1]) {
        case 'asc':
          return livraisons.sort((l1, l2) => l1[0][target].localeCompare(l2[0][target]));
        case 'desc':
          return livraisons.sort((l1, l2) => -l1[0][target].localeCompare(l2[0][target]));
        case 'off':
          return livraisons;
      }
      return [];
    } else {
      switch (this.selectedTri[1]) {
        case 'asc':
          return livraisons.sort((l1, l2) => l1[0][target].valueOf() === l2[0][target].valueOf() ? 0 : l1[0][target] > l2[0][target] ? 1 : -1);
        case 'desc':
          return livraisons.sort((l1, l2) => l1[0][target].valueOf() === l2[0][target].valueOf() ? 0 : l1[0][target] < l2[0][target] ? 1 : -1);
        case 'off':
          return livraisons;
      }
      return [];
    }
  }

  arrayToUpper(arr: string | string[]): any
  {
    let typearr: string = typeof arr;
    if (typearr == "string") {
      return ((arr as string).toUpperCase());
    }
    if (typearr == "Array") {
      return ((arr as Array<string>).map(
        (elem) => {
          return (elem.toUpperCase());
        }
      ));
    }
    return null;
  }

  filtrerCommandes(): void {
    let commandes = this.untouchedFormatCmd;
    for (const target of this.filtres.keys()) { // pour chaque filtre
      commandes = commandes.filter((commande: Array<any>) => {
        let pass = false;
        for (const livraison of commande) { // avec chaque commande
          if (!pass && Object.keys(livraison).find(key => key === target) != null) {
            pass = this.filtres.get(target) != null ? this.arrayToUpper(livraison[target]).includes(this.arrayToUpper(this.filtres.get(target))) : true;
          } else {
            this.getDetailsFromCommande(livraison.numcommande, livraison.numbl).forEach((details: { [x: string]: string | string[]; }) => {
              if (target === 'marque') {
                if (this.filtres.get(target).length === 0) {
                  pass = true;
                } else {
                  for (const mark of this.filtres.get(target)) {
                    pass = pass || details[target].includes(mark);
                  }
                }
              } else {
                this.arrayToUpper(details[target]);
                if (!pass && this.arrayToUpper(details[target]).includes(this.arrayToUpper(this.filtres.get(target)))) {
                  pass = true;
                }
              }
            });
          }
        }
        return pass;
      });
    }
    this.formatCmd = commandes;
  }

  onSearch(target: string, event: string): void
  {
    if (this.currentSearchTarget == target)
    {
      clearTimeout(this.currentSearchId);
    }

    this.currentSearchTarget = target;
    this.currentSearchId = setTimeout(
      () =>
      {
        this.filtres.set(target, event);
        this.filtrerCommandes();
      },
      this.searchMiliDelay
    );
  }

  filtreMarqueToggle(marque: string): void {
    const filtreMarque = this.filtres.get('marque') as Array<string>;
    if (!!filtreMarque.includes(marque)) {
      filtreMarque.splice(filtreMarque.indexOf(marque), 1);
    } else {
      filtreMarque.push(marque);
    }
    this.filtrerCommandes();
  }

  getServerData(event?: PageEvent) {
    if (event) {
      this.pageIndex = event.pageIndex;
      this.pageSize = event.pageSize;
    }
    return event;
  }

  protected readonly faFilePdf = faFilePdf;
  protected readonly faTruck = faTruck;
  protected readonly faPlusCircle = faPlusCircle;
  protected readonly faMinusCircle = faMinusCircle;
}
