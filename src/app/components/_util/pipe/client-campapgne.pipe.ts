import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clientProspectFournisseur',
  standalone: true
})
export class ClientProspectFournisseurPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (value === 'C') {
      return 'Client';
    } else if (value === 'P') {
      return 'Prospect';
    } else if (value === 'F') {
      return 'Fournisseur';
    } else {
      return value;
    }
  }

}
