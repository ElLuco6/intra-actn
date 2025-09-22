import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {
  faEuroSign,
  faExclamationTriangle, faFilePdf, faInfo, faPaperPlane,
  faQuestionCircle, faRedoAlt,
  faShareAlt,
  faStar,
  faTimesCircle, faTrash
} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TooltipComponent implements OnInit {


  /** Delais avant l'apparition du texte lorsque l'on survole le composant avec sa souris */
  @Input() showDelay = 100;
  /** Delais avant la disparition du texte lorsque l'on arrête de survoler le composant avec sa souris */
  @Input() hideDelay = 0;
  /** Texte à afficher lorsque l'on survole le composant avec sa souris */
  @Input() text = 'placeholder';
  /** Définit le type d'icône qui sera affiché et son CSS */
  @Input() type: 'help' | 'edit'|'problem' | 'alert' | 'error' | 'share' | 'favoris' | 'favoris-empty' | 'reload' | 'trash' | 'cart' | 'help-me' | 'assos' | 'pdf' | 'cotation' | 'cotationWarn' | 'location' | 'alertClient'  = 'help';
  /** Position d'affichage du texte par rapport à l'icône */
  @Input() position: 'left' | 'right' | 'above' | 'below' = 'above';

  /** Lien relatif à l'application dun .svg */
  svgAssosPath = 'assets/svg/icone_produit_associe.svg';
  /** Lien relatif à l'application d'un .svg */
  svgLocationPath = 'assets/svg/ico-location-last.svg';

  constructor() { }

  ngOnInit(): void {
  }

  protected readonly faQuestionCircle = faQuestionCircle;
  protected readonly faExclamationTriangle = faExclamationTriangle;
  protected readonly faTimesCircle = faTimesCircle;
  protected readonly faShareAlt = faShareAlt;
  protected readonly faStar = faStar;
  protected readonly faFilePdf = faFilePdf;
  protected readonly faRedoAlt = faRedoAlt;
  protected readonly faTrash = faTrash;
  protected readonly faPaperPlane = faPaperPlane;
  protected readonly faInfo = faInfo;
  protected readonly faEuroSign = faEuroSign;
}
