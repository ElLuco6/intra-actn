import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {LoadingService} from "@services/loading.service";

@Component({
  selector: 'app-new-spinner',
  templateUrl: './new-spinner.component.html',
  styleUrls: ['./new-spinner.component.scss']
})
export class NewSpinnerComponent implements AfterViewInit, OnDestroy {

  loadingSubscription: Subscription;
  state = true;

  constructor(public loadingService: LoadingService) { }

  ngAfterViewInit(): void {
    this.loadingSubscription = this.loadingService.isLoading$.pipe().subscribe((isLoading: boolean) => {
      this.state = isLoading;
    });
  }

  ngOnDestroy(): void {
    this.loadingSubscription.unsubscribe();
  }

}

/**
 * Type pour manipuler la barre de progression du chargement.
 */
export type ProgressBarState = {
  /** true pour afficher la barre de progression, false sinon */
  isShowing: boolean;

  /** Le pourcentage de progression de 0 à 100 */
  progression: number;

  /** Une phrase de description du status */
  texte: string;
}
