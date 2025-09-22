import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ericdateFormat',
 
})
export class EricdateFormatPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: unknown): unknown {
    if (value === '9999999') {
      return 'Non planifié';
    }

    const stringValue = value as string; // Explicitly type value as string
    const date = new Date(stringValue.substring(0, 4) + '-' + stringValue.substring(4, 6) + '-' + stringValue.substring(6, 8));
    return this.datePipe.transform(date, 'yyyy-MM-dd');
  }

}
