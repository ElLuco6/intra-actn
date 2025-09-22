import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {Commande, Client} from "@/models";
import {CartService} from "@services/cart.service";
import {ProduitService} from "@services/produit.service";
import {take} from "rxjs";

@Component({
  selector: 'app-commande-detail',
  templateUrl: './commande-detail.component.html',
  styleUrls: ['./commande-detail.component.scss']
})
export class CommandeDetailComponent implements OnInit {

  environement = environment;
  client: number;
  commande: number;
  detailCommande: Commande[] = [];
  detailCommandeFiltre: Commande[] = [];
  detailClient: Client;
  detailCommandeLoading: boolean;
  detailClientLoading: boolean;

  infoLivCde: Commande;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService,
    private produitService: ProduitService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.client = params['client'];
      this.commande = params['commande'];
    });
    this.detailCommandeLoading = true;
    this.detailClientLoading = true;
    this.getCdeDetail();
  }
  getCdeDetail(){
    return this.http.get<Commande[]>(`${environment.apiUrl}/CommandeUneDetail.php`, {
      params:{
        client: this.client,
        commande: this.commande
      }
    }).subscribe(
      (data) => {
        this.detailCommande = data;
        this.detailCommande.forEach((e) => {
          if(e.produit != undefined && e.quantite != 0){
            e.puht = Number(e.puht);
            e.quantite = Number(e.quantite);
            e['prixTotal'] = e.puht * e.quantite;
            this.detailCommandeFiltre.push(e);
          }
        });
        this.infoLivCde = data[data.length - 1];
        this.getDetailClient();
      }
    )
  }

  getDetailClient(){
    return this.http.get<Client>(`${environment.apiUrl}/ListeClientsDetail.php`, {
      params:{
        numclient: this.client
      },
      withCredentials: true
    }).subscribe(
      (data) => {
        this.detailClient = data;
        this.detailClient = this.detailClient[0];
        this.detailCommandeLoading = false;
      }
    )
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

  protected readonly environment = environment;
}
