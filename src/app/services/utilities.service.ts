import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  integerValidation(event: any) {
    var keyCode = event.which ? event.which : event.keyCode;
    if ((keyCode < 48 || keyCode > 57)) {
      event.preventDefault();
    }
  }

  decimalValidation(event: any) {
    var keyCode = event.which ? event.which : event.keyCode;
    var input = event.target.value;
    // Allow digits, one dot, and minus only at the start
    if (
      (keyCode < 48 || keyCode > 57) && // not a digit
      keyCode !== 46 && // not a dot
      !(keyCode === 45 && input.length === 0) // allow minus only at start
    ) {
      event.preventDefault();
    }
    // Prevent more than one dot
    if (keyCode === 46 && input.includes('.')) {
      event.preventDefault();
    }
    // Prevent more than one minus or minus not at start
    if (keyCode === 45 && (input.includes('-') || event.target.selectionStart !== 0)) {
      event.preventDefault();
    }
  }
}
