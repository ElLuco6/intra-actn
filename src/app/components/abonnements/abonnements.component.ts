import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '@env/environment';
import { AbonnementClient } from './abonnements.service';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-abonnements',
  templateUrl: './abonnements.component.html',
  styleUrls: ['./abonnements.component.scss']
})
export class AbonnementsComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  expandedElement: any | null = null;

  filtresForm: FormGroup;

  displayedColumns: string[] = ['expand', 'numero', 'dossier', 'clientraisonsociale', 'devis', 'client', 'revendeurnom', 'services', 'statut', 'editer'];
  colonnesAffichees: { id: string, nom: string }[] = [
    { id: 'numero', nom: 'N° de Dossier' },
    { id: 'dossier', nom: 'Dossier' },
    { id: 'clientraisonsociale', nom: 'Client final' },
    { id: 'devis', nom: 'Devis' },
    { id: 'client', nom: 'N° Revendeur' },
    { id: 'revendeurnom', nom: 'Nom du revendeur' },
    { id: 'services', nom: 'Services' },
    { id: 'statut', nom: 'Statut' }
  ];

  sortedAbonnements: AbonnementClient[] = [];
  sortedProducts;

  dataSource: MatTableDataSource<AbonnementClient>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.filtresForm = new FormBuilder().group({
      numero: [''],
      dossier: [''],
      clientraisonsociale: [''],
      devis: [''],
      client: [''],
      revendeurnom: [''],
      services: [''],
      statut: ['']
    });

    this.getAbonnements();
  }

  getAbonnements() {
    this.http.get<AbonnementClient[]>(`${environment.apiUrl}/OnlywanMaj.php`, {
      withCredentials: true,
      params: {
        mode: 'SEL'
      }
    }).subscribe((data) => {
      this.sortedAbonnements = data.sort((a, b) => Number(b.numero) - Number(a.numero));
      this.dataSource = new MatTableDataSource(this.sortedAbonnements);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  getProduitsClient(numero: number) {
    this.http
      .get<any[]>(`${environment.apiUrl}/OnlywanMajDetail.php`, {
        withCredentials: true,
        responseType: 'json',
        params: {
          mode: 'SEL',
          numero: numero
        }
      })
      .subscribe((produits) => {
        const abonnement = this.sortedAbonnements.find(abonnement => Number(abonnement.numero) === numero);
        if (abonnement) {
          abonnement.produits = produits;
        }
        this.sortedProducts = produits;
      });
  }

  toggleRow(row: AbonnementClient) {
    if (this.expandedElement === row) {
      this.expandedElement = null;
      this.sortedProducts = undefined;
    } else {
      this.expandedElement = row;
      this.sortedProducts = undefined;
      this.getProduitsClient(Number(row.numero));
    }
  }

  sortData(sort: Sort) {
    const data = this.sortedAbonnements.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedAbonnements = data;
      return;
    }

    this.sortedAbonnements = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'numero':
          return this.compareNumber(a.numero, b.numero, isAsc);
        case 'dossier':
          return this.compareString(a.dossier, b.dossier, isAsc);
        case 'clientraisonsociale':
          return this.compareString(a.clientraisonsociale, b.clientraisonsociale, isAsc);
        case 'devis':
          return this.compareNumber(a.devis, b.devis, isAsc);
        case 'client':
          return this.compareNumber(a.client, b.client, isAsc);
        case 'nomRevendeur':
          return this.compareString(a.revendeurnom, b.revendeurnom, isAsc);
        case 'services':
          return this.compareString(a.services, b.services, isAsc);
        case 'statut':
          return this.compareString(a.statut, b.statut, isAsc);
        default:
          return 0;
      }
    });
    this.dataSource = new MatTableDataSource(this.sortedAbonnements);
    this.dataSource.paginator = this.paginator;

    this.applyFilters();
  }

  applyFilters(): void {
    const formValues = this.filtresForm.value;

    this.dataSource.filterPredicate = (data, filter) => {
      const filters = JSON.parse(filter);

      for (const key in filters) {
        if (filters[key]) {
          const columnValue = data[key] ? data[key].toString().toLowerCase() : '';
          if (!columnValue.includes(filters[key].toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    };

    const filterString = JSON.stringify(formValues);

    this.dataSource.filter = filterString.trim().toLowerCase();
  }

  sortProducts(sort: Sort) {
    const data = this.sortedProducts!.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedProducts = data;
      return;
    }

    this.sortedProducts = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'ligne':
          return this.compareNumber(a.ligne, b.ligne, isAsc);
        case 'produit':
          return this.compareString(a.produit, b.produit, isAsc);
        case 'quantite':
          return this.compareNumber(a.quantite, b.quantite, isAsc);
        case 'nature':
          return this.compareString(a.nature, b.nature, isAsc);
        case 'periodefac':
          return this.compareString(a.periodefac, b.periodefac, isAsc);
        case 'datedeb':
          return this.compareDate(a.datedeb, b.datedeb, isAsc);
        case 'datedernierefact':
          return this.compareDate(a.datedernierefact, b.datedernierefact, isAsc);
        case 'actif':
          return this.compareString(a.actif, b.actif, isAsc);
        default:
          return 0;
      }
    });
  }

  isAllActive(products: any[]): boolean {
    return !products.some(product => product.actif !== 'O');
  }

  compareString(a: string, b: string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  compareNumber(a: string, b: string, isAsc: boolean) {
    const value = parseInt(a) < parseInt(b) ? 1 : -1;
    return isAsc ? value : -1 * value;
  }

  compareDate(a: string, b: string, isAsc: boolean) {
    const value = new Date(a) < new Date(b) ? 1 : -1;
    return isAsc ? value : -1 * value;
  }

  editerUtilisateur(numero: number) {
    this.router.navigateByUrl(`abonnements/editer-utilisateur/${numero}/0`)
  }

  editerProduits(numero: number) {
    this.router.navigateByUrl(`abonnements/editer-utilisateur/${numero}/1`)
  }

}
