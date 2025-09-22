import {Component, Input, OnInit} from '@angular/core';
import {faChevronDown} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-title-w-line',
  templateUrl: './title-w-line.component.html',
  styleUrls: ['./title-w-line.component.scss']
})
export class TitleWLineComponent implements OnInit {
  faChevronDown = faChevronDown;

  /** Titre affiché par le composant */
  @Input() title: string;
  /** Nom de la classe css de title-w-line.component.scss à rajouter à la ligne du titre */
  @Input() size: string;
  /** Texte à afficher en petit à côté du titre */
  @Input() annotation = "";
  /** Bool : Est-ce que l'on affiche la ligne après le titre ? */
  @Input() withLine = true;
  @Input() collapsible;
  @Input() doWrap :boolean ;

  @Input() collapsed = false;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Inverse l'état collapsed du titre.
   */
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

}
