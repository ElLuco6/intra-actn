import {Component, Input, OnInit} from '@angular/core';
import {Produit} from "@/models";
import {environment} from "@env/environment";

@Component({
  selector: 'app-pdf-icon',
  templateUrl: './pdf-icon.component.html',
  styleUrls: ['./pdf-icon.component.scss']
})
export class PdfIconComponent implements OnInit {
  @Input() readonly produit: Produit = null;
  @Input() showLibelle = true;
  @Input() urlStart: string = environment.produitPdfUrl;

  environment = environment;

  constructor() { }

  ngOnInit(): void {
  }
}
