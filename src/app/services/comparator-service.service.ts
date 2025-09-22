import { Injectable } from '@angular/core';
import { Produit } from "../models/produit";

@Injectable({
  providedIn: 'root'
})
export class ComparatorService {

  private _produits: Produit[] = [];

  get produits() {
    return this._produits;
  }

  constructor() { }

  addProduit(produit: Produit) {
    this._produits.push(produit);
  }

  removeProduit(produit: Produit) {
    this._produits.splice(this._produits.indexOf(produit), 1);
  }
}
