import {Produit} from './produit';
import {Cotation} from './cotation';

/**
 * Modèle d'un item dans le panier.
 */
export class CartItem {
  /**
   * Le produit représenté par l'item.
   */
  produit: Produit;
  /**
   * La qte de ce produit dans le panier.
   */
  qte: number;
  /**
   * Cotation appliquée au produit dans le panier
   * Aucune cotation appliquée si vide ou null
   */
  cotation: Cotation;

  /** Commentaire lier au produit actuellement dans le panier */
  commentaire: string;

  modifActiv: boolean;
  prixSaisi: number;
  order: number;
  constructor() { }

  /**
   * Permet de récupérer un type CartItem depuis un objet non typé.
   * Utilisé pour reformer les items depuis les valeurs JSON enregistrées dans le localStorage.
   * @param obj L'objet non typé représentant l'item.
   */
  static fromObject(obj: any): CartItem {
    const cartItem: CartItem = new CartItem();

    for (const [property, value] of Object.entries(obj)) {
      cartItem[property] = value;
    }
    return cartItem;
  }

  /**
   * Récupérer le nombre de produits actuellements en stock.
   */
  get partQteDisponible() {
    return this.produit.qteStock1;
  }

  /**
   * @returns Le coût H.T. total pour la qte souhaitée de ce produit.
   */
  get total() {
    // si une cotation est active
    if (this.cotation)
    {
      return Math.round((+this.cotation.prixvente * +this.qte) * 100) / 100;
    }
    else
    {
      if(this.prixSaisi){
        return Math.round((this.prixSaisi * +this.qte) * 100) / 100;
      }
      // si un prix par quantité s'applique
      else if (this.produit.hasPriceByQte)
      {
        let qpai: number = this.priceByQtyAppliedIndex;
        return Math.round((+this.produit.qtePrice[qpai].price * +this.qte) * 100) / 100;
      }
      else // total normal
      {
        return Math.round((+this.produit.prix * +this.qte) * 100) / 100;
      }
    }
  }

  get totalTpa(){
    if (this.cotation)
    {
      return Math.round((this.cotation.prixrevient * this.qte) * 100) / 100;
    }
    else
    {
      return Math.round((this.produit.prixrevient * this.qte) * 100) / 100;
    }
  }

  get margeParProduit(){
    if (this.cotation)
    {
      let marge: number = this.cotation.prixvente - Number(this.cotation.prixrevient);
      return Math.round(((marge*100)/this.cotation.prixvente) * 100) /100;
    }else{
      if(this.prixSaisi != 0 && this.prixSaisi != undefined && !isNaN(this.prixSaisi)){
        let marge: number = this.prixSaisi - this.produit.prixrevient;
        return Math.round(((marge*100)/this.prixSaisi) * 100) /100;
      } else if (this.produit.hasPriceByQte)
      {
        let qpai: number = this.priceByQtyAppliedIndex;
        let marge: number = this.produit.qtePrice[qpai].price - this.produit.prixrevient;
        return Math.round(((marge*100)/this.produit.prix) * 100) /100;
      }
      else // total normal
      {
        let marge: number = this.produit.prix - this.produit.prixrevient;
        return Math.round(((marge*100)/this.produit.prix) * 100) /100;
      }
    }
  }

  /**
   * @returns L'index du tableau 'qtePrice' de ce produit, correspondant à la quantité du produit dans le panier
   */
  get priceByQtyAppliedIndex(): number {
    if (this.produit.hasPriceByQte && this.produit.qtePrice.length > 0) {
      const sortedQtePrice = this.produit.qtePrice.sort((a, b) => a.qte - b.qte);
      return sortedQtePrice.filter(qp => qp.qte <= this.qte).length - 1
    }
    return 0;
  }

  /**
   * @returns Le coût total de l'écopart pour la qte souhaitée de ce produit.
   */
  get totalEcoPart() {
    return +this.produit.prixD3E * +this.qte;
  }
}
