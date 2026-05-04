import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function swissPhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();

    if (!value) {
      return null;
    }

    const normalized = value.replace(/\s/g, '');

    const swissPhoneRegex =
      /^(?:\+41|0041|0)(?:7[5-9]|2[1246]|3[1234]|4[134]|5[2568]|6[12]|8[14])\d{7}$/;

    return swissPhoneRegex.test(normalized)
      ? null
      : { swissPhone: true };
  };
}
