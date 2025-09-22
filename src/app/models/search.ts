import {CataloguePosition} from "./catalogue";
import {User} from "./user";

export class Search {
  position: CataloguePosition ;
  search: string;
  marque: string;
  user: User;

  constructor(position?: CataloguePosition, search?: string, marque?: string, user?: User){
    this.position = position || new CataloguePosition();
    this.search = search || '';
    this.marque = marque || '';
    this.user = user || null;
  }

  equals(o: Search): boolean{
    return o.position.category === this.position.category
      && o.position.subCategory === this.position.subCategory
      && o.position.subSubCategory === this.position.subSubCategory
      && o.search === this.search
      && o.marque === this.marque
      && o.user?.id === this.user?.id;
  }
}
