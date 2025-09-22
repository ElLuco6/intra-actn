import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeZeros'
})
export class ZerosPipe implements PipeTransform {
  transform(value: string): string {
    if (value && typeof value === 'string') {
      return value.replace(/^0+/, ''); // Supprime les zéros initiaux
    }
    return value;
  }
}
