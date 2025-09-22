import {Injectable} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {Filter} from "@models/filter";
import {Client} from "@/models";
import {main} from "@popperjs/core";

/**
 * FilterService est un service Angular qui fournit des méthodes pour générer les filtres.
 * !!! Attention !!! S'utilise uniquement avec MatTableDataSource et FilterComponent.
 * @service
 */
@Injectable({
  providedIn: 'root'
})
export class FilterService {

  filterDepartments(clients: Client[], selectedRegions: string[]): string[] {
    if (selectedRegions.length === 0) {
      return clients
        .map(client => client.departementlib)
        .filter((value, index, self) => self.indexOf(value) === index);
    } else {
      return clients
        .filter(client => selectedRegions.includes(client.region))
        .map(client => client.departementlib)
        .filter((value, index, self) => self.indexOf(value) === index);
    }
  }


  filterVilles(clients: Client[], selectedRegions: string[], selectedDepartements: string[]): string[] {
    if (selectedRegions.length === 0 && selectedDepartements.length === 0) {
      return clients
        .map(client => client.ville)
        .filter((value, index, self) => self.indexOf(value) === index);
    } else if (selectedDepartements.length === 0) {
      return clients
        .filter(client => selectedRegions.includes(client.region))
        .map(client => client.ville)
        .filter((value, index, self) => self.indexOf(value) === index);
    } else if (selectedRegions.length === 0) {
      return clients
        .filter(client => selectedDepartements.includes(client.departementlib))
        .map(client => client.ville)
        .filter((value, index, self) => self.indexOf(value) === index);
    } else {
      return clients
        .filter(client => selectedRegions.includes(client.region) && selectedDepartements.includes(client.departementlib))
        .map(client => client.ville)
        .filter((value, index, self) => self.indexOf(value) === index);
    }
  }

  /**
   * Crée des instances de FormControl pour chaque nom de filtre fourni.
   *
   * @param {string[]} filterNames - Les noms des filtres pour lesquels créer des instances de FormControl.
   * @returns { { [key: string]: FormControl } } - Un objet contenant les instances de FormControl, indexées par le nom du filtre.
   */
  createFormControls(filterNames: string[]): { [key: string]: FormControl } {
    let formControls: { [key: string]: FormControl } = {};
    filterNames.forEach(filterName => {
      if(filterName.includes('date')){
        formControls[filterName] = new FormControl({value: [], disabled: true});
      }else{
        formControls[filterName] = new FormControl([]);
      }
    });
    return formControls;
  }

  /**
   * Applique les filtres à la source de données fournie.
   *
   * @param {MatTableDataSource<any>} dataSource - La source de données à filtrer.
   * @param { { [key: string]: FormControl } } filters - Les instances de FormControl pour chaque filtre.
   * @param {Filter[]} filtres - Les configurations de filtre.
   */
  applyFilter(dataSource: MatTableDataSource<any>, filters: { [key: string]: FormControl }, filtres: Filter[]) {
    dataSource.filterPredicate = (data: any, filter: string) => {
      const filterValues = JSON.parse(filter);

      const checkNested = (obj: any, key: string, value: any): boolean => {
        if (obj.hasOwnProperty(key)) {
          return obj[key].toString().toLowerCase().includes(value.toString().toLowerCase());
        }
        for (const k in obj) {
          if (obj[k] && typeof obj[k] === 'object') {
            if (checkNested(obj[k], key, value)) {
              return true;
            }
          }
        }
        return false;
      };

      for (const key in filterValues) {
        if (filterValues[key].length > 0) {
          const filterType = filtres.find(filtre => filtre.control === key).type;
          if (filterType === 'input' && !checkNested(data, key, filterValues[key])) {
            return false;
          } else if ((filterType === 'select' || filterType === 'maj' || filterType === 'actif') && !filterValues[key].includes(data[key]) && !checkNested(data, key, filterValues[key])) {
            return false;
          } else if (filterType === 'date' && new Date(data[key]) < new Date(filterValues[key]) && !checkNested(data, key, filterValues[key])) {
            return false;
          } else if (filterType === 'dateAsc' && (new Date(data[key]) < new Date(filterValues[key])) && !checkNested(data, key, filterValues[key])) {
            return false;
          } else if (filterType === 'dateDesc' && (new Date(data[key]) > new Date(filterValues[key])) && !checkNested(data, key, filterValues[key])) {
            return false;
          }
        }
      }

      return true;
    };

    for (const key in filters) {
      filters[key].valueChanges.subscribe(() => {
        this.applyFilterValues(dataSource, filters);
      });
    }
  }


  /**
   * Obtient les valeurs uniques pour une propriété spécifique dans un tableau de données.
   *
   * @param {MatTableDataSource<any>} dataArray - Le tableau de données.
   * @param {string} propertyName - Le nom de la propriété pour laquelle obtenir les valeurs uniques.
   * @param sortFn - Permet de faire un tri personnalisé des valeurs uniques.
   * @returns {any[]} - Un tableau contenant les valeurs uniques.
   */
  getUniqueValues(dataArray: MatTableDataSource<any>, propertyName: string, sortFn?: (a: any, b: any) => number): any[] {
    let uniqueValues = new Set();

    const extractValues = (data: any, propertyName: string) => {
      if (Array.isArray(data)) {
        data.forEach(item => extractValues(item, propertyName));
      } else if (typeof data === 'object') {
        for (const key in data) {
          if (key === propertyName && data[key] !== '' && data[key] !== '**************************') {
            uniqueValues.add(data[key]);
          } else if (typeof data[key] === 'object') {
            extractValues(data[key], propertyName);
          }
        }
      }
    };

    dataArray.data.forEach(item => extractValues(item, propertyName));

    let uniqueValuesArray = Array.from(uniqueValues);
    if (sortFn) {
      return uniqueValuesArray.sort(sortFn);
    } else {
      return uniqueValuesArray.sort();
    }
  }
  /**
   * Initialise les filtres pour une source de données spécifique.
   *
   * @param {MatTableDataSource<any>} data - La source de données à filtrer.
   * @param { { name: string, type: string, displayName?: string }[] } filterConfigs - Les configurations de filtre.
   * @returns { { filtres: Filter[], filtreControls: { [key: string]: FormControl } } } - Un objet contenant les configurations de filtre et les instances de FormControl pour chaque filtre.
   */
  initFiltres(data: MatTableDataSource<any>, filterConfigs: { name: string, type: string, displayName?: string }[]): { filtres: Filter[]; filtreControls: { [key: string]: FormControl; }; } {
    let filtres = filterConfigs.map(({ name, type, displayName }) => ({
      name: displayName || name.charAt(0).toUpperCase() + name.slice(1),
      control: name,
      options: this.getUniqueValues(data, name),
      type: type
    }));
    let filtreControls = this.createFormControls(filterConfigs.map(config => config.name));
    this.applyFilter(data, filtreControls, filtres);
    return { filtres, filtreControls };
  }

  /**
   * Applique les valeurs de filtre à une source de données spécifique.
   *
   * @private
   * @param {MatTableDataSource<any>} dataSource - La source de données à filtrer.
   * @param { { [key: string]: FormControl } } filters - Les instances de FormControl pour chaque filtre.
   */
  private applyFilterValues(dataSource: MatTableDataSource<any>, filters: { [key: string]: FormControl }) {
    const filterValues = {};

    for (const key in filters) {
      filterValues[key] = filters[key].value;
    }

    const cache = new Set();
    dataSource.filter = JSON.stringify(filterValues, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return;
        }
        cache.add(value);
      }
      return value;
    });
    cache.clear();
  }

  filterCa(arr: any[], values: any[]){
    let listTest: any[] = [];
    values.forEach((client) => {
      let caTotal: number = 0;
      for (let i = 0; i < arr[0].length; i++) {
        caTotal += Number(client[arr[0][i]]);
      }
      let minAmount = arr[1] !== '' ? Number(arr[1]) : -Infinity;
      let maxAmount = arr[2] !== '' ? Number(arr[2]) : Infinity;
      if(caTotal >= minAmount && caTotal <= maxAmount) {
        listTest.push(client);
      }
    });
    return listTest;
  }
}
