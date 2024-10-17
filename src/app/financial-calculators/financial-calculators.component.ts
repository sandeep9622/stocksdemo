import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-financial-calculators',
  templateUrl: './financial-calculators.component.html',
  styleUrls: ['./financial-calculators.component.css']
})
export class FinancialCalculatorsComponent {
  lumpsumForm!:FormGroup;

  constructor(private fb:FormBuilder){}

  ngOnInit(){
    this.lumpsumForm = this.fb.group({
      principal:["",[Validators.required]],
      rate:['',[Validators.required]],
      time:['',[Validators.required]]
    })
  }
}
