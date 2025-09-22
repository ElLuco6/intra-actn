import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function siretValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const siret = control.value;
    if (!siret) {
      return null;
    }

    if (!/^\d{14}$/.test(siret)) {
      return { invalidSiret: 'Le SIRET doit contenir exactement 14 chiffres' };
    }

    if (!isValidLuhn(siret)) {
      return { invalidSiret: 'Le SIRET fourni est invalide' };
    }

    return null;
  };
}

function isValidLuhn(siret: string): boolean {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i], 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
