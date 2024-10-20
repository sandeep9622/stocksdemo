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

  returns: number = 0;
  totalAmount: number = 0;

  pieChartOptions: any;
  yearwiseGraphChartOptions: any;

  constructor(private fb: FormBuilder, private service: UtilitiesService) { }

  ngOnInit() {
    this.lumpsumForm = this.fb.group({
      principal: ["", [Validators.required]],
      rate: ['', [Validators.required]],
      time: ['', [Validators.required]]
    })

    this.lumpsumForm.valueChanges.subscribe(() => {
      let prinicpal = this.lumpsumForm.get("principal")?.value
      let rate = this.lumpsumForm.get("rate")?.value
      let time = this.lumpsumForm.get("time")?.value
      if (Number(prinicpal) && Number(rate) && Number(time)) {
        this.CalculateLumpSum(Number(prinicpal), Number(rate), Number(time))
      }
    });


  }

  CalculateLumpSum(prinicpal: number, rate: number, time: number) {
    this.totalAmount = Math.round(prinicpal * Math.pow((1 + rate / 100), time));
    this.returns = Math.round(this.totalAmount - prinicpal);

    let labels: string[] = [];
    let data: number[] = [];

    if (time > 1) {
      let yearStepper = Math.round((time ? time : 1) / 10);

      yearStepper = yearStepper <= 1 ? 1 : yearStepper;

      for (let i = 0; i <= time; i += yearStepper) {
        labels.push(i <= 1 ? `${i} Year` : `${i} Years`);
        data.push(i == 0 ? prinicpal : Math.round(prinicpal * Math.pow((1 + rate / 100), i)))
      }
    }
    else {
      labels = [];
      data = [];
    }


    this.fillCharts(prinicpal, this.returns, labels, data)
  }

  principalSliderChanged(event: any) {
    this.lumpsumForm.get("principal")?.setValue(event.target.value);
  }

  rangeSliderChanged(event: any) {
    this.lumpsumForm.get("rate")?.setValue(event.target.value);
  }

  timeSliderChanged(event: any) {
    this.lumpsumForm.get("time")?.setValue(event.target.value)
  }

  fillCharts(principal: number, returns: number, labels: string[], data: number[]) {
    this.pieChartOptions = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 24,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: principal, name: 'Invested Amount' },
            { value: returns, name: 'Predicted Returns' }
          ]
        }
      ]
    };

    this.yearwiseGraphChartOptions = {
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          data: data,
          type: 'bar'
        }
      ]
    };
  }
}
