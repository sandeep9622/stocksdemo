import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpService } from '../services/http.service';
import { Constants } from '../config/constants';
import * as echarts from 'echarts';

@Component({
  selector: 'app-investments-timeline-tracker',
  templateUrl: './investments-timeline-tracker.component.html',
  styleUrls: ['./investments-timeline-tracker.component.css']
})
export class InvestmentsTimelineTrackerComponent implements OnInit {
  investmentForm!: FormGroup; // Reactive form
  selectedFile: File | null = null;
  records: { month: string; year: number; amount: number }[] = [];
  noRecordsMessage: string = '';
  displayedColumns: string[] = ['month', 'year', 'amount'];
  dataSource = new MatTableDataSource(this.records);

  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private httpService: HttpService) {}

  ngOnInit(): void {
    this.initializeYears();
    this.initializeForm();
    this.fetchTableData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  initializeYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = 2024; year <= currentYear; year++) {
      this.years.push(year);
    }
  }

  initializeForm(): void {
    this.investmentForm = this.fb.group({
      month: ['', Validators.required],
      year: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  onSaveRecord(): void {
    if (this.investmentForm.valid) {
      const newRecord = this.investmentForm.value;
      this.records.push(newRecord);
      this.dataSource.data = this.records; // Update the table
      this.investmentForm.reset(); // Reset the form
    } else {
      alert('Please fill out all fields correctly.');
    }
  }

  fetchTableData(): void {
    this.httpService.get(Constants.APIURL + 'monthly-investments').subscribe(
      (response: any) => {
        if (response && response.length > 0) {
          this.records = response;
          this.dataSource.data = this.records;
          this.noRecordsMessage = '';
          this.initChart(this.records); // Initialize the chart with API data
        } else {
          this.records = [];
          this.dataSource.data = [];
          this.noRecordsMessage = 'No records found.';
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.records = [];
        this.dataSource.data = [];
        this.noRecordsMessage = 'An error occurred while fetching data.';
      }
    );
  }

  initChart(data: { month: string; year: number; amount: number }[]): void {
    const chartDom = document.getElementById('chartContainer')!;
    const chart = echarts.init(chartDom);

    const months = data.map((record) => record.month);
    const amounts = data.map((record) => record.amount);

    const option = {
      title: { text: 'Month-by-Month Growth', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: months, axisLabel: { rotate: 45 } },
      yAxis: { type: 'value', name: 'Amount' },
      series: [{ data: amounts, type: 'line', smooth: true, areaStyle: {} }]
    };

    chart.setOption(option);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const fileNameElement = document.getElementById('fileName');
      if (fileNameElement) {
        fileNameElement.textContent = this.selectedFile.name;
      }
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.httpService.post(Constants.APIURL + 'monthly-investments', formData).subscribe(
        (response) => {
          console.log('Upload successful', response);
          this.fetchTableData(); // Refresh table data after successful upload
        },
        (error) => {
          console.error('Upload failed', error);
        }
      );
    } else {
      alert('Please select a file before uploading.');
    }
  }
}
