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
  sipForm!:FormGroup;

  onlyNumeric = this.service.integerValidation;
  numericDecimal = this.service.decimalValidation;

  returns: number = 0;
  totalAmount: number = 0;

  sipReturns: number = 0;
  sipTotalInvestment:number = 0;
  sipTotalAmount: number = 0;

  pieChartOptions: any;
  yearwiseGraphChartOptions: any;

  constructor(private fb: FormBuilder, private service: UtilitiesService) { }

  ngOnInit() {
    this.lumpsumForm = this.fb.group({
      principal: ["", [Validators.required]],
      rate: ['', [Validators.required]],
      time: ['', [Validators.required]]
    });

    this.sipForm = this.fb.group({
      monthlyInvestment:["",[Validators.required]],
      rate:["",[Validators.required]],
      time:["",[Validators.required]]
    });

    this.lumpsumForm.valueChanges.subscribe(() => {
      let prinicpal = this.lumpsumForm.get("principal")?.value;
      let rate = this.lumpsumForm.get("rate")?.value;
      let time = this.lumpsumForm.get("time")?.value;
      if (Number(prinicpal) && Number(rate) && Number(time)) {
        this.CalculateLumpSum(Number(prinicpal), Number(rate), Number(time));
      }
    });

    this.sipForm.valueChanges.subscribe(() => {
      let monthlyInvestment = this.sipForm.get("monthlyInvestment")?.value;
      let rate = this.sipForm.get("rate")?.value;
      let time = this.sipForm.get("time")?.value;

      if (Number(monthlyInvestment) && Number(rate) && Number(time)) {
        this.calculateSipReturns(Number(monthlyInvestment), Number(rate), Number(time));
      }
    })

    this.test();


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

  calculateSipReturns(monthlyInvestment:number,rate:number,time:number){
    debugger
    const rateDelimiter = 100;
    const montlhyRateDelimiter = 12;

    const realRateDenominator = rateDelimiter * montlhyRateDelimiter;

    let realrate = rate / realRateDenominator;

    let base = (1 + realrate);
    let power = (time * 12) - 1;
    let devider = realrate;

    let middlepart =  Math.pow(base,power) / devider;
    this.sipTotalAmount = Math.round((monthlyInvestment) * middlepart * (1 + realrate))

    this.sipTotalInvestment = Math.round(monthlyInvestment * time * 12);
    this.sipReturns = Math.round(this.sipTotalAmount - this.sipTotalInvestment);
  }

  principalSliderChanged(event: any) {
    this.lumpsumForm.get("principal")?.setValue(event.target.value);
  }

  rangeSliderChanged(event: any) {
    this.lumpsumForm.get("rate")?.setValue(event.target.value);
  }

  timeSliderChanged(event: any) {
    this.lumpsumForm.get("time")?.setValue(event.target.value);
  }

  monthlyInvestmentSliderChanged(event:any){
    this.sipForm.get("monthlyInvestment")?.setValue(event.target.value);
  }

  siprangeSliderChanged(event: any) {
    this.sipForm.get("rate")?.setValue(event.target.value);
  }

  siptimeSliderChanged(event: any) {
    this.sipForm.get("time")?.setValue(event.target.value);
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

  test(){
    let M:number = 0,P:number = 1000,i:number = 0.01,n:number = 12;
    M = P * (((1 + i)^n - 1) / i) * (1 + i)
    console.log("calc is : ",M);
  }
}
