import { CartItem } from './cart-item';

/**
 * Modèle de l'objet représentant le panier.
 */
export class Cart {

  /**
   * Map contenant l'ensemble des items présents dans le panier, accessible par la référence de leur produit.
   */
  items: { [reference: string]: CartItem } = {};
  numDevis: string = "";
  refDevis: string = "";

  /**
   * Reconstitue un object Cart depuis un objet de type non défini.
   * Permet par exemple de récupérer un objet Cart depuis la version du panier enregistré en JSON dans le localStorage.
   * @param obj L'objet de type non défini représentant un panier.
   */
  static fromObject(obj: any): Cart {
    const cart = new Cart();

    for (const [ref, item] of Object.entries(obj.items)) {
      cart.items[ref] = CartItem.fromObject(item);
    }
    return cart;
  }

  /**
   * @returns Coût H.T. total du panier.
   */
  get total() {
    return Object.values(this.items).reduce((a, b) => a + (b.total || 0), 0);
  }

  get totalTpa() {
    return Object.values(this.items).reduce((a, b) => a + (b.totalTpa || 0), 0);
  }

  get margeTotal() {
    let marge: number = this.total - this.totalTpa;
    return Math.round(((marge/this.total) * 100) * 100) / 100;
  }

  /**
   * @returns Coût H.T. total de l'écopart du panier.
   */
  get totalEcoPart() {
    return Object.values(this.items).reduce(
      (a, b) => a + (b.totalEcoPart || 0),
      0
    );
  }

  /**
   * @returns Quantité totale de produits dans le panier.
   */
  get qteProduits() {
    const qte = 0;
    return Object.values(this.items).reduce((acc, item) => acc + item.qte, 0);
  }

  /**
   * @returns nombre d'items dans le panier
   */
  get length() {
    return Object.values(this.items).reduce((a, b) => a + 1, 0);
  }
}
