import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilitiesService } from '../services/utilities.service';

@Component({
  selector: 'app-financial-calculators',
  templateUrl: './financial-calculators.component.html',
  styleUrls: ['./financial-calculators.component.css']
})
export class FinancialCalculatorsComponent {
  lumpsumForm!: FormGroup;

  onlyNumeric = this.service.integerValidation;
  numericDecimal = this.service.decimalValidation;

  constructor(private fb: FormBuilder, private service: UtilitiesService) { }

  ngOnInit() {
    this.lumpsumForm = this.fb.group({
      principal: ["", [Validators.required]],
      rate: ['', [Validators.required]],
      time: ['', [Validators.required]]
    })
  }
}
