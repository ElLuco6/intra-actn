import { Injectable } from '@angular/core';
import {FormGroup} from "@angular/forms";
import {Client} from "@/models";

@Injectable({
    providedIn: 'root'
})
export class SortAndFilterService {

    private _filterVariables: Map<string, Map<string, PageFilter>>;
    private _sortVariables: Map<string, [string, string, string]>;

    constructor() {
        this._filterVariables = new Map<string, Map<string, PageFilter>>();
        this._sortVariables = new Map<string, [string, string, string]>();
    }

    /**
     * Renvoie les valeurs d'une variable de filtre d'une page.
     * @param name L'identifiant de la page
     * @param filtre Le nom du filtre
     * @param method
     */
    public getFiltre(name: string, filtre: string, method: string): unknown {
        return this._filterVariables.get(name)?.get(filtre + method)?.value;
    }

    /**
     * Remet à 0 un filtre d'une page.
     * @param name L'identifiant de la page
     * @param filtre Le nom du filtre
     */
    public resetFiltre(name: string, filtre: string): void {
        this._filterVariables.get(name).set(filtre, new PageFilter());
    }

    /**
     * Définit les variables de filtrages d'un tableau et le filtre puis le tri.
     * @param name L'identifiant de la page
     * @param target Le nom de la cible sur laquelle filtrer le tableau
     * @param type Le type des données qui vont être filtrées
     * @param method La méthode de filtrage (dépend du type) :
     * - **array** : includes
     * - **string** : equals, includes
     * - **date** | **number** : EQ (=), GT (>), LT (<), GE (>=), LE (<=)
     * @param val La valeur de filtrage
     * @param values Le tableau de valeurs à filtrer
     *
     * @returns Le tableau de valeurs trié et filtré
     */
    public onFiltre<T>(name: string, target: string, type: string, method: string, val: unknown |unknown[], values: Array<T>): Array<T> {
        let filter = this._filterVariables.get(name);

        if (!filter) {
            filter = new Map<string, PageFilter>();
        }
        const pf = new PageFilter();
        pf.target = target.split('.');
        pf.type = type;
        pf.method = method;
        pf.value = val;
        filter.set(target + method, pf);
        this._filterVariables.set(name, filter);
        return this.trier(name, this.filtrer(name, values));
    }

    /**
     * Filtre un tableau de valeurs selon les variables définies précedemment.
     * @param name L'identifiant de la page
     * @param values Le tableau de valeurs à filtrer
     * @returns Le tableau de valeurs filtré
     */
    public filtrer<T>(name: string, values: Array<T>): Array<T> {
        let arr = values;
        const filters = this._filterVariables.get(name)

        if (filters) {
            for (const filter of filters.values()) {
                switch (filter.type) {
                    case 'array':
                        arr = this._filtrerArray(filter, arr);
                        break;
                    case 'string':
                        arr = this._filtrerString(filter, arr);
                        break;
                    case 'date':
                        arr = this._filtrerDate(filter, arr);
                        break;
                    case 'number':
                        arr = this._filtrerNumber(filter, arr);
                        break;
                    case 'CA':
                        arr = this._filtrerCa(filter, arr);
                        break;
                }
            }
        }
        return arr;
    }

    private _filtrerCa<T>(filter: PageFilter, values: Array<T>){
      const filterValues = filter.value as Array<any>;
      let listTest: any[] = [];
      values.forEach((d) => {
        let caTotal: number = 0;
        for (let i = 0; i < filterValues[0].length; i++) {
          caTotal += Number(d[filterValues[0][i]]);
        }
        if((filterValues[1] != '' && filterValues[2] != '' && caTotal >= filterValues[1] && caTotal <= filterValues[2]) ||
          (filterValues[1] != '' && filterValues[2] == '' && caTotal >= filterValues[1]) ||
          (filterValues[2] != '' && filterValues[1] == '' && caTotal <= filterValues[2])) {
          listTest.push(d);
        }

      });
      return listTest;
    }

    /**
     * Filtre un tableau de valeurs sur une cible de type *Array*.
     * @param filter Le filtre à appliquer
     * @param values Le tableau de valeurs à filtrer
     * @returns Le tableau de valeurs filtrées
     */
    private _filtrerArray<T>(filter: PageFilter, values: Array<T>): Array<T> {
        if (values !== undefined) {
        const filterValues = filter.value as Array<unknown>;
        if (filterValues.length > 0) {
            return values.filter(value => this._fromTheDeep(filter.target, value, 0, (v) => filterValues.includes(v)));
        } else {
            return values;
        }
    }
    return []
    }

    /**
     * Filtre un tableau de valeurs sur une cible de type *string*.
     * @param filter Le filtre à appliquer
     * @param values Le tableau de valeurs à filtrer
     * @returns Le tableau de valeurs filtrées
     */
    private _filtrerString<T>(filter: PageFilter, values: Array<T>): Array<T> {
        const filterValue = (filter.value as string).toLocaleLowerCase();
        switch (filter.method) {
            case 'equals':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0, (v: string) => v.toLocaleLowerCase() === filterValue));
            case 'includes':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0, (v: string) => v.toString().toLocaleLowerCase().includes(filterValue)));
            case 'startWith':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0, (v: string) => v.toLocaleLowerCase().startsWith(filterValue)));
        }
        return values //care ajouter pour debug
    }

    /**
     * Filtre un tableau de valeurs sur une cible de type *Date*.
     * @param filter Le filtre à appliquer
     * @param values Le tableau de valeurs à filtrer
     * @returns Le tableau de valeurs filtrées
     */
    private _filtrerDate<T>(filter: PageFilter, values: Array<T>): Array<T> {
        const filterValue = filter.value as Date ?? new Date("1900-01-01");
        switch (filter.method) {
            case 'EQ':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: Date) => d.getTime() === filterValue.getTime()));
            case 'GT':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: Date) => d.getTime() > filterValue.getTime()));
            case 'LT':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: Date) => d.getTime() < filterValue.getTime()));
            case 'GE':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: Date) => d.getTime() >= filterValue.getTime()));
            case 'LE':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: Date) => d.getTime() <= filterValue.getTime()));
        }
        return values //care ajouter pour debug
    }

    /**
     * Filtre un tableau de valeurs sur une cible de type *number*.
     * @param filter Le filtre à appliquer
     * @param values Le tableau de valeurs à filtrer
     * @returns Le tableau de valeurs filtrées
     */
    private _filtrerNumber<T>(filter: PageFilter, values: Array<T>): Array<T> {
        const filterValue = filter.value as any;
        switch (filter.method) {
            case 'EQ':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: number) => d === filterValue));
            case 'GT':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: number) => d > filterValue));
            case 'LT':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: number) => d < filterValue));
            case 'GE':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: number) => d >= filterValue));
            case 'LE':
                return values.filter(value => this._fromTheDeep(filter.target, value, 0 , (d: number) => d <= filterValue));
        }
        return values //care ajouter pour debug
    }

    /**
     * Effectue une recherche profonde pour un objet donné et indique si celui vérifie une certaine fonction fournie.
     * @param targets La liste des cibles sur laquelle descendre dans l'objet
     * @param value L'objet à inspecter
     * @param index L'index des cibles actuelles de recherche
     * @param fn Une fonction de vérification de la cible finale
     * @returns true si la cible finale vérifie la fonction fournie, false sinon
     */
    private _fromTheDeep(targets: Array<string>, value: unknown, index: number, fn: (a: unknown) => boolean): boolean {
        if (index === targets.length - 1) {
            if (Array.isArray(value)) {
                return value.some(v => fn(v[targets[index]]));
            } else {
              return fn(value[targets[index]]);
            }
        } else {
            if (Array.isArray(value)) {
                return value.some(v => this._fromTheDeep(targets, v[targets[index]], index + 1, fn));
            } else {
                return this._fromTheDeep(targets, value[targets[index]], index + 1, fn);
            }
        }
    }

    /**
     * Renvoie les valeurs de la variable de tri d'une page.
     * @param name L'identifiant de la page
     * @returns Un tableau contenant la variable sur laquelle le tri est effectué et l'ordre de tri
     */
    public getTri(name: string): [string, string] {
        const tri = this._sortVariables.get(name);
        if (tri) {
            return [tri[0], tri[2]];
        } else {
            return ['', ''];
        }
    }

    /**
     * Affecte manuellement la valeur de tri d'une page.
     * @param name L'identifiant de la page
     * @param tri La colonne de tri
     * @param type Le type de tri
     * @param order L'ordre du tri
     */
    public setTri(name: string, tri: string, type: string, order: string): void {
        this._sortVariables.set(name, [tri, type, order]);
    }

    /**
     * Définit les variables de tri d'un tableau et le tri.
     * @param name L'identifiant de la page
     * @param tri Le nom de la cible sur laquelle trier le tableau
     * @param type Le type du tri (string, number ou date)
     * @param values Le tableau de valeurs à trier
     * @returns Le tableau de valeurs trié
     */
    public onTri<T>(name: string, tri: string, type: string, values: Array<T>): Array<T> {
        let sort = this._sortVariables.get(name);
        if (!sort) {
            sort = [tri, type, 'asc'];
        } else {
            if (sort[0] === tri) {
                switch (sort[2]) {
                    case 'off':
                        sort[2] = 'asc';
                        break;
                    case 'asc':
                        sort[2] = 'desc';
                        break;
                    case 'desc':
                        sort[2] = 'asc';
                        break;
                    default:
                        sort[2] = 'off';
                        break;
                }
            } else {
                sort = [tri, type, 'asc'];
            }
        }
        this._sortVariables.set(name, sort);
        return this.trier(name, values);
    }

    /**
     * Tri un tableau de valeur selon les variables de tri prédéfinies.
     * @param name L'identifiant de la page
     * @param values Le tableau de valeurs à trier
     * @returns Le tableau de valeurs trié
     */
    public trier<T>(name: string, values: Array<T>): Array<T> {
        const sort = this._sortVariables.get(name) ?? ['', '', ''];
        const fn = (value: unknown, str: string) => str.split('.').reduce((acc, val) => acc?.[val], value);
        switch (sort[1]) {
            case 'string':
                return sort[2] === 'asc' ?
                    values.sort((v1, v2) => (fn(v1, sort[0]) as string).localeCompare((fn(v2, sort[0]) as string)))
                    : values.sort((v1, v2) => -(fn(v1, sort[0]) as string).localeCompare((fn(v2, sort[0]) as string)));
            case 'number':
                return sort[2] === 'asc' ?
                    values.sort((v1, v2) => (fn(v1, sort[0]) as number) - (fn(v2, sort[0]) as number))
                    : values.sort((v1, v2) => (fn(v2, sort[0]) as number) - (fn(v1, sort[0]) as number));
            case 'date':
                return sort[2] === 'asc' ?
                    values.sort((v1, v2) => (fn(v1, sort[0]) as Date).getTime() - (fn(v2, sort[0]) as Date).getTime())
                    : values.sort((v1, v2) => (fn(v2, sort[0]) as Date).getTime() - (fn(v1, sort[0]) as Date).getTime());
            default:
                return values;
        }
    }
}

/**
 * Une classe définissant un filtre
 * @property **target** : Un tableau de cible sur lesquelles appliquer le filtrage
 *
 * Ex : Pour un devis ["produits", "prod"] pour effectuer une recherche sur la référence de chacun des produits de la liste des produits.
 *
 * @property **type** : Le type de la donnée finale (array, date, number, string)
 * @property **method** : La méthode de filtrage à appliquer
 * @property **value** : La valeur sur laquelle filtrer
 */
export class PageFilter {
    target: Array<string>;
    type: string;
    method: string;
    value: unknown;
}
