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
      const formValue = this.investmentForm.value;

      // Map month name to its numeric value (e.g., January -> 01)
      const monthIndex = this.months.indexOf(formValue.month) + 1; // Months are 1-based
      const monthValue = monthIndex < 10 ? `0${monthIndex}` : monthIndex; // Add leading zero if needed

      // Construct the monthYear string in the format "YYYY-MM-01"
      const monthYear = `${formValue.year}-${monthValue}-01`;

      // Create the payload with the formatted monthYear
      const newRecord = {
        monthYear: monthYear, // Use the constructed string
        amount: formValue.amount
      };

      // Call the API to save the record
      this.httpService.post(Constants.APIURL + 'monthly-investments/single', newRecord).subscribe(
        (response: any) => {
          console.log('Record saved successfully:', response);

          // Add the new record to the table only if the API call is successful
          this.records.push({
            month: formValue.month,
            year: formValue.year,
            amount: formValue.amount
          });
          this.dataSource.data = this.records; // Update the table
          this.investmentForm.reset(); // Reset the form
        },
        (error) => {
          console.error('Error saving record:', error);
          alert('An error occurred while saving the record. Please try again.');
        }
      );
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

    // Combine month and year for x-axis labels
    const monthYearLabels = data.map((record) => `${record.month} ${record.year}`);
    const amounts = data.map((record) => record.amount);

    // Determine line segment colors based on trend
    const lineColors = amounts.map((value, index) => {
      if (index === 0) return 'green'; // Default color for the first point
      return value >= amounts[index - 1] ? 'green' : 'red'; // Green for upward, red for downward
    });

    // Highlight lowest and highest points for each year
    const markPoints = [];
    const groupedByYear = data.reduce((acc, record, index) => {
      const year = record.year;
      if (!acc[year]) acc[year] = [];
      acc[year].push({ ...record, index });
      return acc;
    }, {} as { [key: number]: { month: string; year: number; amount: number; index: number }[] });

    for (const year in groupedByYear) {
      const yearData = groupedByYear[year];
      const lowest = yearData.reduce((min, record) => (record.amount < min.amount ? record : min));
      const highest = yearData.reduce((max, record) => (record.amount > max.amount ? record : max));

      // Add marker for the lowest point (transparent fill with border)
      markPoints.push({
        coord: [lowest.index, lowest.amount],
        value: `${lowest.amount}`,
        symbol: 'circle', // Use a circle for the dot
        symbolSize: 20, // Big dot size
        itemStyle: {
          color: 'rgba(255, 255, 255, 0)', // Transparent fill
          borderColor: 'black', // Black border
          borderWidth: 2 // Border width
        },
        label: {
          show: true,
          position: 'bottom', // Position the label below the dot
          formatter: `${lowest.amount}`
        }
      });

      // Add marker for the highest point (transparent fill with border)
      markPoints.push({
        coord: [highest.index, highest.amount],
        value: `${highest.amount}`,
        symbol: 'circle', // Use a circle for the dot
        symbolSize: 20, // Big dot size
        itemStyle: {
          color: 'rgba(255, 255, 255, 0)', // Transparent fill
          borderColor: 'black', // Black border
          borderWidth: 2 // Border width
        },
        label: {
          show: true,
          position: 'top', // Position the label above the dot
          formatter: `${highest.amount}`
        }
      });
    }

    const option = {
      title: { text: 'Month-by-Month Growth', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: monthYearLabels, // Use combined month and year labels
        axisLabel: {
          rotate: 45, // Rotate labels for better readability
          formatter: (value: string) => value // Optional: Customize label formatting
        }
      },
      yAxis: {
        type: 'value',
        name: 'Amount'
      },
      series: [
        {
          data: amounts,
          type: 'line',
          smooth: true,
          lineStyle: {
            color: (params: any) => lineColors[params.dataIndex] // Set line color dynamically
          },
          itemStyle: {
            color: (params: any) => lineColors[params.dataIndex] // Set point color dynamically
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1, // Horizontal gradient for vertical blocks
              y2: 0,
              colorStops: amounts.map((value, index) => ({
                offset: index / (amounts.length - 1),
                color: lineColors[index]
              }))
            }
          },
          markPoint: {
            data: markPoints, // Highlight specific points with big dots
            animation: true, // Enable animation for the dots
            animationDuration: 1000, // Animation duration in milliseconds
            animationEasing: 'elasticOut' // Easing effect for the animation
          }
        }
      ]
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
