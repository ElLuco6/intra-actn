import { Component, OnInit, OnDestroy} from '@angular/core';
import { environment } from "../../../../environments/environment";
import { WindowService } from "../../../services/window.service";
import { CatalogueService } from "../../../services/catalogue.service";

import { take } from 'rxjs/operators';
import { KeyValue } from '@angular/common';
@Component({
	selector: 'app-metiers',
	templateUrl: './metiers.component.html',
	styleUrls: ['./metiers.component.scss']
})
export class MetiersComponent implements OnInit {

	environment = environment;
	Categories: [] = [];
	// categories: Array<[string, string]>;
	type = "";

	public isReady = false;
	public categories = new Map<string, { marque: string, marquelib: string }[]>();

	public categorie = new Map<string, { code: string, sequence: string }>();

	public compareFn(a: KeyValue<string, any>, b: KeyValue<string, any>): number {
		return +this.categorie.get(a.key).sequence - +this.categorie.get(b.key).sequence;
	}

	constructor(
		private catalogueService: CatalogueService,
		private window: WindowService) { }

	ngOnInit(): void {

		this.catalogueService.getCategoriesMarque()
			.pipe(take(1))
			.subscribe(
				(ret) => {
					Object.values(ret).forEach(categorie => {
						if (categorie['niv1'] != 'FOR' ) {
							if (this.categories.get(categorie['niv1lib'])) {
								this.categories.set(categorie['niv1lib'], [...this.categories.get(categorie['niv1lib']), { marque: categorie['marque'], marquelib: categorie['marquelib'] }]);
							} else {
								this.categories.set(categorie['niv1lib'], [{ marque: categorie['marque'], marquelib: categorie['marquelib'] }]);
								this.categorie.set(categorie['niv1lib'], { code: categorie['niv1'], sequence: categorie['sequence'] });
							}
						}

					});
					// this.Categories = ret;
					// this.window.setTimeout(() => this.categories = Array.from(this.categories).sort((m1, m2) => m1[0].localeCompare(m2[0])));
					//this.marqueParCategorie();
					this.isReady = true;
				},
				(error) => {
					console.error('Erreur dans MetiersComponent, sur la requete \'ListeNiv1Marque.php\'  :', error);
				}
			);

	}

}
