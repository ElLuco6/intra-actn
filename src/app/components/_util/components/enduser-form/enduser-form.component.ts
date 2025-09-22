import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AdresseService} from "@services/adresse.service";
import {CartItem, Produit} from "@/models";
import {Observable, Subject} from "rxjs";
import {map, take, takeUntil} from "rxjs/operators";
import {LicenceService} from "@services/licence.service";
import {Client} from "@models/licence";

const phoneRegex = /^(?:(?:\+|00)33[\s.-]{0,3}(?:\(0\)[\s.-]{0,3})?|0)[1-9](?:(?:[\s.-]?\d{2}){4}|\d{2}(?:[\s.-]?\d{3}){2})$/;


@Component({
  selector: 'app-enduser-form',
  templateUrl: './enduser-form.component.html',
  styleUrls: ['./enduser-form.component.scss']
})
export class EnduserFormComponent implements OnInit {

  @Input() title = 'Informations Client Final';

  @Input()
  get client(): Client {
    return this._client;
  }
  set client(client: Client) {
    this._client = client;
    setTimeout(() => this._client.pays = client.pays?.substr(0, 2));
    const setter = (target: string) => {
      client[target] !== 'n.c.'
        ? this.enduserForm?.get(target)?.setValue(client?.[target])
        : this.enduserForm?.get(target)?.setValue('n.c.');
    };
    setter('nom');
    setter('mail');
    setter('adresse1');
    setter('adresse2');
    setter('codepostal');
    setter('ville');
    setter('telephone');
    setter('pays');
    setter('serie');
    setter('numtva');
  }

  @Input() set produits(cartItems: { [reference: string]: CartItem; }) {
    this._produits = new Array<Produit>();
    for (const cartItem of Object.values(cartItems)) {
      this._produits.push(cartItem.produit);
    }
  }

  @Input()
  get serialNumber(): { mandatory: boolean, name: string; } {
    return this._serialNumber;
  }
  set serialNumber(value: { mandatory: boolean, name: string; }) {
    this._serialNumber = value;
  }

  @Output() clientChange = new EventEmitter<Client>();

  get valid(): boolean {
    this.enduserForm.markAllAsTouched();
    return this.enduserForm.valid;
  }

  enduserForm: FormGroup;

  adresses$: Observable<any>;
  pays$: Observable<any>;
  formDirective: Map<string, Map<string, boolean>>;
  ready = false;

  private _serialNumber = {
    mandatory: false,
    name: ''
  };
  private _produits = new Array<Produit>();
  private _client = new Client();
  private _destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    public adresseService: AdresseService,
    private licenceService: LicenceService
  ) { }

  ngOnInit(): void {
    this.pays$ = this.adresseService.getCountries();
    this.licenceService.getEnduserFormulaire()
      .pipe(
        take(1),
        takeUntil(this._destroy$))
      .subscribe(data => {
        const produit = this._produits.find(p => p.gabarit === 'V');
        if (produit && !this.serialNumber.mandatory) {
          this.serialNumber.mandatory =
            data
              .get(produit.marque)
              ?.get('serie')
              ?.['obligatoire']
            && Object.values(produit) //Si une valeur du produit est = a RENEW renvoie true
              .some(
                v => v === 'RENEW'
              );

          this.serialNumber.name = data.get(produit.marque)?.get('serie')?.['nom'];
        }
        this.formDirective = data;
        this.reset();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  isRequired(champ: string): boolean {
    for (const [key, value] of this.formDirective.entries()) {
      if (this._produits.some(produit => produit.marque === key && produit.gabarit === 'V') && value.get(champ)) {
        return true;
      }
    }
    return false;
  }

  IsTvaNbr(champ: FormControl)
  {
    if (champ.value == "" || champ.value == null) {
      return (true);
    }
    var reg = /^(RO\d{2,10}|GB\d{5}|(ATU|DK|FI|HU|LU|MT|CZ|SI)\d{8}|IE[A-Z\d]{8}|(DE|BG|EE|EL|LT|BE0|PT|CZ)\d{9}|CY\d{8}[A-Z]|(ES|GB)[A-Z\d]{9}|(BE0|PL|SK|CZ)\d{10}|(FR|IT|LV)\d{11}|(LT|SE)\d{12}|(NL|GB)[A-Z\d]{12})$/;
    if (reg.test(champ.value)) {
      return null;
    } else {
      return { IsTva: { valid: false } };
    }
  }

  reset(): void {
    this.enduserForm = this.formBuilder.group({
      nom: [
        this._client?.nom, (this.isRequired('nom') ? [Validators.required] : [])
      ],
      mail: [
        this._client?.mail, (this.isRequired('mail') ? [Validators.required] : []).concat(Validators.email)
      ],
      adresse1: [
        this._client?.adresse1, (this.isRequired('adresse1') ? [Validators.required] : [])
      ],
      adresse2: [
        this._client?.adresse2
      ],
      codepostal: [
        this._client?.codepostal, (this.isRequired('codepostal') ? [Validators.required] : [])
      ],
      ville: [
        this._client?.ville, (this.isRequired('ville') ? [Validators.required] : [])
      ],
      pays: [
        this._client?.pays, (this.isRequired('pays') ? [Validators.required] : [])
      ],
      numtva: [
        this._client?.numtva, (this.isRequired('numtva') ? [Validators.required, this.IsTvaNbr] : [this.IsTvaNbr])
      ],
      telephone: [
        this._client?.telephone, (this.isRequired('telephone') ? [Validators.required] : []).concat(Validators.pattern(phoneRegex))
      ],
      serie: [
        this._client?.serie, (this.serialNumber.mandatory ? [Validators.required] : [])
      ],
    });

    this.onChange('nom');
    this.onChange('mail');
    this.onChange('adresse1');
    this.onChange('adresse2');
    this.onChange('codepostal');
    this.onChange('ville');
    this.onChange('numtva');
    this.onChange('telephone');
    this.onChange('pays');
    this.onChange('serie');

    this.enduserForm.get('pays').setValue('FR');

    this.ready = true;
  }

  /**
   * Modifie une propriété d'un client en même temps que le champs correspondant est modifié.
   * @param target Le nom de la propriété du client à modifier en même temps que le champs correspondant
   */
  onChange(target: string): void {
    this.enduserForm.get(target).valueChanges.pipe(takeUntil(this._destroy$)).subscribe(value => {
      this.client[target] = value;
      this.send();
    });
  }

  /**
   * Émet les nouvelles données du client.
   */
  send(): void {
    this._client = new Client(
      this.enduserForm.get('adresse1').value,
      this.enduserForm.get('adresse2').value,
      this.enduserForm.get('codepostal').value,
      this.enduserForm.get('mail').value,
      this.enduserForm.get('nom').value,
      this.enduserForm.get('telephone').value,
      this.enduserForm.get('ville').value,
      this.enduserForm.get('pays').value,
      this.enduserForm.get('serie').value,
      this.enduserForm.get('numtva').value
    );
    this._client.serie = this.enduserForm.get('serie').value;
    this.clientChange.emit(this._client);
  }

  onAdresseChange(input: InputEvent): void {
    const adresse = this.enduserForm.get('adresse1').value as string;
    if (adresse.length > 5) {
      this.adresses$ = this.adresseService.findAdresse(adresse)
        .pipe(
          take(1),
          map(adresses => {
            return adresses['features'].sort((ad1, ad2) => +ad2['properties']['score'] - +ad1['properties']['score']);
          })
        );
    }
  }

  onAdresseSelected(adresse: Array<any>): void {
    this.enduserForm.get('codepostal').setValue(adresse['postcode']);
    this.enduserForm.get('ville').setValue(adresse['city']);
    this.enduserForm.get('pays').setValue('FR');
  }

}
