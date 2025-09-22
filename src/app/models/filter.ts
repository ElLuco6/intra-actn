import {FormControl} from "@angular/forms";

export class Filter {
  name: string;
  options: any[];
  control: string;
  type: string;
}

export class FilterControl {
  [key: string]: FormControl
}
