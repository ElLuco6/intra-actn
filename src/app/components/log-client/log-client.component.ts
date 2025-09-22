import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {LogClientService, PredictionResultsClient} from "@services/log-client.service";
import {filter, takeUntil} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {PredictionResults} from "@services/catalogue-search-prediction.service";
import {MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {NavigationEnd, Router} from "@angular/router";
import {CotationService} from "@services/cotation.service";

@Component({
  selector: 'app-log-client',
  templateUrl: './log-client.component.html',
  styleUrls: ['./log-client.component.scss']
})
export class LogClientComponent implements OnInit {

  @Output() EventLogIn = new EventEmitter<void>();
  @Output() hasFocusedInputChange = new EventEmitter<boolean>();
  connectionFailure = false;
  private _destroy$ = new Subject<void>();
  autoCompleteOptions$: Observable<PredictionResultsClient>;
  searching: string;
  openSearch = false;
  logInput:FormControl;
  selectedClientCode: string | null = null;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  constructor(
    private formBuilder: FormBuilder,
    private logClient: LogClientService,
    private predictionService: LogClientService,
    private cotationService: CotationService,

    ) {


    }

    onOptionSelected(event: MatAutocompleteSelectedEvent): void {
      // Store the original client code when an option is selected
      this.selectedClientCode = event.option.value;
      this.loginClient()
    }
    ngOnInit(): void {
    this.logInput = new FormControl('', Validators.required);
    this.logInput.valueChanges.subscribe(searchString => {

      this.searching = searchString;
      this.predictionService.searchString = searchString;
    });
    this.predictionService.searchString$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      if(this.searching){
        if(this.searching !== value){
          this.logInput.setValue(value.toString());
        }
        this.autoCompleteOptions$ = this.predictionService.getPredict(value, true);
        this.searching = value.toUpperCase();
      }
    })
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }


  //Dans le cas ou l'on se connecte a un client sur une autre page client on doit recharger la page



  loginClient(){
   // this.logInput.value  = this.logInput.value.toString()
    let val = this.logInput.value


    this.logClient.logClient( Number(val)
    ).subscribe((user) => {

      if(user.error == undefined){

        this.EventLogIn.emit();
        //this.cotationService.cotationClient(this.logClient.currentClient.id);
      }else{


        this.connectionFailure = true;
      }
    });

    this.inputUnFocused();
  }

  inputUnFocused() {
    this.hasFocusedInputChange.emit(false);
  }

  deco(){
    this.logClient.logClientOut().subscribe(d => d);
  }

  inputFocused() {
    this.hasFocusedInputChange.emit(true);
  }

  start(mot: string): string {
    // verification de la recherche présente dans le mot
    if (mot.includes(this.searching)) {
      // découpage du mot pour ne renvoyer que le début (avant l'occurence de la recherche)
      return mot.slice(0, mot.indexOf(this.searching, 0));
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return mot;
    }
  }


  // meme fonction qui permet de renvoyer la fin du mot
  end(mot: string): string {
    if (mot.includes(this.searching)) {
      return mot.slice(mot.indexOf(this.searching, 0) + this.searching.length);
    }
    else {
      // si la recherche n'est pas dans le mot (cas possible que lors d'une recherche reference/deignation),
      // la fonction start renvoie le mot et la fonction end renvoie la chaine vide afin de ne pas avoir de modification du mot
      return '';
    }
  }

}
