import { Component, OnInit } from '@angular/core';
import { AuthenticationService} from "@services/authentication.service";
import {CatalogueService} from "@services/catalogue.service";
import {ActivatedRoute, Router } from "@angular/router";
import {isEmpty, Observable} from 'rxjs';
import { Tree, Categorie } from '@/models';
import { environment } from '@env/environment';
import { take } from 'rxjs/operators';
import {faCalendarAlt} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.scss']
})
export class CategorieComponent implements OnInit {

  constructor(
    public authService: AuthenticationService,
    private route: ActivatedRoute,
    private catalogueService: CatalogueService,
    private router: Router
  ) { }

  environment = environment;
  chemin = null;
  niveau = null;
  structureCatalogue: Observable<Tree<Categorie>>;

  ngOnInit() {
    this.chemin = this.route.snapshot.params;
    this.niveau = Object.keys(this.chemin).length;
    this.structureCatalogue = this.catalogueService.getStructure();
    if (this.niveau === 2) {
      this.structureCatalogue.pipe(take(1)).subscribe((structure) => {
        const cat = structure.nodes.find(categorie => categorie.value.label === this.chemin['niv1']);
        const subCat = cat.nodes.find(subCategorie => subCategorie.value.label === this.chemin['niv2']);
        if (subCat.nodes == null || subCat.nodes.length === 0) {
          this.router.navigate(['/catalogue', cat.value.label, subCat.value.label, 'unique']);
        }
      });
    }
  }

  protected readonly faCalendarAlt = faCalendarAlt;
}
