import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ericFaute',
  standalone: true
})
export class EricFautePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return value === 'PROSPE' ? 'PROSPECT' : 'CLIENT';
  }

}
