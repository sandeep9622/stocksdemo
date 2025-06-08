import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { EChartsOption } from 'echarts';
import { Constants } from '../config/constants';
import { Stock } from '../models/Stock';
import { HttpService } from '../services/http.service';
import { JSONService } from '../services/json.service';
import { UtilitiesService } from '../services/utilities.service';
import { ConfirmationBoxComponent } from '../shared/confirmation-box/confirmation-box.component';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-portfolio-tracker',
  templateUrl: './portfolio-tracker.component.html',
  styleUrls: ['./portfolio-tracker.component.css']
})
export class PortfolioTrackerComponent {
  stocksForm: UntypedFormGroup = this.fb.group({
    stockName: ['', [Validators.required]],
    price: ['', [Validators.required]],
    quantity: ['', [Validators.required]],
    sector: ['', [Validators.required]],
    marketCap: ['', [Validators.required]],
    totalInvestment: ['', [Validators.required]],
    currentPrice: [''],
    oneYearReturns: [''],
    threeYearReturns: [''],
    fiveYearReturns: [''],
    id: [{ value: '', disabled: true }]
  });

  stocksList: Stock[] = [];
  submitted: boolean = false;
  isEdit: boolean = false;
  displayedColumns: String[] = ["SerialNo", "stockName", "quantity", "price", "totalInvestment", "currentPrice", "currentValue", "marketCap", "sector", "oneYearReturns", "threeYearReturns", "fiveYearReturns", "returns", "actions"];
  dataSource!: MatTableDataSource<Stock>;
  localStorageName: string = 'StocksList';

  onlyNumeric = this.service.integerValidation;
  numericDecimal = this.service.decimalValidation;

  totalAmount: number = 0;
  currentValue: number = 0;

  chartOption: EChartsOption = {};
  chartOptionBar: EChartsOption = {};
  chartOptionCompare: EChartsOption = {};
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('TABLE') table!: ElementRef;
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  isExpanded = {
    stocksForm: true,
    stocksTable: true,
    portfolio: true,
    charts: true,
    availableStocks: true
  };

  constructor(public json: JSONService, private fb: UntypedFormBuilder, public service: UtilitiesService, private httpService: HttpService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.BindStocks();
  }

  get s() { return this.stocksForm.controls }

  Save() {
    this.submitted = true;
    if (this.stocksForm.valid) {
      this.httpService.post(Constants.APIURL + "stock", this.stocksForm.value).subscribe(resp => {
        this.BindStocks();
        this.submitted = false;
        this.Cancel();
      });
    }
    else {
      //focus on invalid form control && show toster
    }
  }

  Edit(item: any) {
    this.isEdit = true;
    this.stocksForm.patchValue(item);
    if (this.tabGroup) {
      this.tabGroup.selectedIndex = 0; // Switch to Stocks Form tab
    }
  }

  Update() {
    debugger
    this.submitted = true;
    if (this.stocksForm.valid) {
      this.httpService.put(Constants.APIURL + 'stock/' + this.stocksForm.getRawValue().id, this.stocksForm.getRawValue()).subscribe(resp => {
        this.BindStocks();
        this.Cancel();
      });
    }
    else {
      //focus on invalid form control && show toster
    }
  }

  Delete(Id: number) {
    debugger
    const dialogRef = this.dialog.open(ConfirmationBoxComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.httpService.delete(Constants.APIURL + "stock/" + Id, {}).subscribe(resp => {
          this.BindStocks();
        })
      }
    });
  }

  Cancel() {
    this.stocksForm.reset();
    this.submitted = false;
    this.isEdit = false;
  }

  BindStocks() {
    this.httpService.get(Constants.APIURL + "stock", {}).subscribe(resp => {
      console.log(resp);
      let list: any = resp;
      if (list) {
        this.stocksList = list;
        this.dataSource = new MatTableDataSource<Stock>(this.stocksList);
        this.stocksList.forEach(e => e.totalInvestment = Number(e.totalInvestment.toFixed(2)));
        this.stocksList.forEach(e => e.currentValue = Number(Number(e.quantity * e.currentPrice).toFixed(2)));
        this.calculateTotalAmount();
        this.fillChart();
        this.dataSource = new MatTableDataSource<Stock>(this.stocksList);
        this.dataSource.sort = this.sort;
      }
    });
  }

  calculateTotalInvestment() {
    let price = this.stocksForm.value.price;
    let quantity = this.stocksForm.value.quantity;
    if (price && quantity) {
      let totalInvestment = price * quantity;
      this.stocksForm.controls["totalInvestment"].setValue(Number(totalInvestment.toFixed(2)));
    }
  }

  calculateTotalAmount() {
    this.totalAmount = 0;
    if (this.stocksList?.length > 0) {
      this.stocksList.forEach(e => {
        this.totalAmount = e.totalInvestment + this.totalAmount;
        this.currentValue = (e.currentPrice * e.quantity) + this.currentValue;
      });
      this.totalAmount = Number(this.totalAmount.toFixed(2));
      this.currentValue = Number(this.currentValue.toFixed(2));
    }
  }

  fillChart() {
    if (this.stocksList?.length > 0) {
      let datalist: any = [];

      this.stocksList.forEach(e => {
        let obj: any = {};
        obj.name = e.stockName;
        obj.value = e.totalInvestment;
        datalist.push(obj);
      });

      this.chartOption = {
        tooltip: {
          trigger: 'item'
        },
        series: {
          type: 'pie',
          radius: '60%',
          data: datalist,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.5)'
            }
          }
        }
      };

      this.chartOptionBar = {
        xAxis: {
          data: this.stocksList.map(x => x.stockName),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {

        },

        tooltip: {
          trigger: 'item'
        },
        series:
        {
          type: 'bar',
          data: this.stocksList.map(x => x.totalInvestment),
        }
      };


      this.chartOptionCompare = {
        xAxis: {
          data: this.stocksList.map(x => x.stockName),
          axisLabel: {
            interval: 0,
            rotate: 45
          }
        },
        yAxis: {

        },

        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'bar',
            data: this.stocksList.map(x => x.totalInvestment),
          },
          {
            type: 'bar',
            data: this.stocksList.map(x => x.currentPrice * x.quantity)
          }
        ]
      };
    }
  }

  exportAsExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.table.nativeElement);//converts a DOM TABLE element to a worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, 'SheetJS.xlsx');
  }

  toggleSection(section: keyof typeof this.isExpanded) {
    this.isExpanded[section] = !this.isExpanded[section];
  }

  getColorClass(value: number): string {
    if (value === null || value === undefined) return '';
    if (value === 0) return 'zero';

    // Negative ranges
    if (value < 0) {
      if (value <= -24.507) return 'neg-1';
      if (value <= -21.784) return 'neg-2';
      if (value <= -19.061) return 'neg-3';
      if (value <= -16.338) return 'neg-4';
      if (value <= -13.615) return 'neg-5';
      if (value <= -10.892) return 'neg-6';
      if (value <= -8.169) return 'neg-7';
      if (value <= -5.446) return 'neg-8';
      if (value <= -2.723) return 'neg-9';
      return 'neg-10';
    }

    // Positive ranges
    if (value <= 73.599) return 'pos-1';
    if (value <= 147.198) return 'pos-2';
    if (value <= 220.797) return 'pos-3';
    if (value <= 294.396) return 'pos-4';
    if (value <= 367.995) return 'pos-5';
    if (value <= 441.594) return 'pos-6';
    if (value <= 515.193) return 'pos-7';
    if (value <= 588.792) return 'pos-8';
    if (value <= 662.391) return 'pos-9';
    return 'pos-10';
  }
}
