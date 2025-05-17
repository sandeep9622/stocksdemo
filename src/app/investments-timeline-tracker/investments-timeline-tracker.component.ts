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

  initChart(data: { month: string; year: number; amount: number }[], groupingLogic: string = 'calendarYear'): void {
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

    // Highlight lowest and highest points based on grouping logic
    const markPoints: any = [];

    if (groupingLogic === 'calendarYear') {
      // Group data by calendar year
      const yearMap = new Map<number, { month: string; year: number; amount: number; index: number }[]>();
      data.forEach((record, index) => {
        if (!yearMap.has(record.year)) {
          yearMap.set(record.year, []);
        }
        yearMap.get(record.year)!.push({ ...record, index });
      });

      yearMap.forEach((records) => {
        const lowest = records.reduce((min, record) => (record.amount < min.amount ? record : min));
        const highest = records.reduce((max, record) => (record.amount > max.amount ? record : max));

        // Add marker for the lowest point (red border)
        markPoints.push({
          coord: [lowest.index, lowest.amount],
          value: `${lowest.amount}`,
          symbol: 'circle',
          symbolSize: 20,
          itemStyle: { color: 'rgba(255, 255, 255, 0)', borderColor: 'red', borderWidth: 2 },
          label: { show: true, position: 'bottom', formatter: `${lowest.amount}` }
        });

        // Add marker for the highest point (green border)
        markPoints.push({
          coord: [highest.index, highest.amount],
          value: `${highest.amount}`,
          symbol: 'circle',
          symbolSize: 20,
          itemStyle: { color: 'rgba(255, 255, 255, 0)', borderColor: 'green', borderWidth: 2 },
          label: { show: true, position: 'top', formatter: `${highest.amount}` }
        });
      });
    } else if (groupingLogic === 'rollingFromStart') {
      let startIndex = data.findIndex((record) => record.amount === Math.min(...amounts));
      while (startIndex < data.length) {
        const period = data.slice(startIndex, startIndex + 12).map((record, idx) => ({ ...record, index: startIndex + idx }));

        const lowest = period.reduce((min, record) => (record.amount < min.amount ? record : min));
        const highest = period.reduce((max, record) => (record.amount > max.amount ? record : max));

        // Add marker for the lowest point (red border)
        markPoints.push({
          coord: [lowest.index, lowest.amount],
          value: `${lowest.amount}`,
          symbol: 'circle',
          symbolSize: 20,
          itemStyle: { color: 'rgba(255, 255, 255, 0)', borderColor: 'red', borderWidth: 2 },
          label: { show: true, position: 'bottom', formatter: `${lowest.amount}` }
        });

        // Add marker for the highest point (green border)
        markPoints.push({
          coord: [highest.index, highest.amount],
          value: `${highest.amount}`,
          symbol: 'circle',
          symbolSize: 20,
          itemStyle: { color: 'rgba(255, 255, 255, 0)', borderColor: 'green', borderWidth: 2 },
          label: { show: true, position: 'top', formatter: `${highest.amount}` }
        });

        startIndex += 12; // Move to the next period
      }
    } else if (groupingLogic === 'rollingFromEnd') {
      let startIndex = data.length - 1;
      while (startIndex >= 0) {
        const period = data.slice(Math.max(0, startIndex - 11), startIndex + 1).map((record, idx) => ({
          ...record,
          index: Math.max(0, startIndex - 11) + idx
        }));

        const lowest = period.reduce((min, record) => (record.amount < min.amount ? record : min));
        const highest = period.reduce((max, record) => (record.amount > max.amount ? record : max));

        // Add marker for the lowest point (red border)
        markPoints.push({
          coord: [lowest.index, lowest.amount],
          value: `${lowest.amount}`,
          symbol: 'circle',
          symbolSize: 20,
          itemStyle: { color: 'rgba(255, 255, 255, 0)', borderColor: 'red', borderWidth: 2 },
          label: { show: true, position: 'bottom', formatter: `${lowest.amount}` }
        });

        // Add marker for the highest point (green border)
        markPoints.push({
          coord: [highest.index, highest.amount],
          value: `${highest.amount}`,
          symbol: 'circle',
          symbolSize: 20,
          itemStyle: { color: 'rgba(255, 255, 255, 0)', borderColor: 'green', borderWidth: 2 },
          label: { show: true, position: 'top', formatter: `${highest.amount}` }
        });

        startIndex -= 12; // Move to the previous period
      }
    }

    const option = {
      title: { text: 'Month-by-Month Growth', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: monthYearLabels,
        axisLabel: { rotate: 45, formatter: (value: string) => value }
      },
      yAxis: { type: 'value', name: 'Amount' },
      series: [
        {
          data: amounts,
          type: 'line',
          smooth: true,
          lineStyle: { color: (params: any) => lineColors[params.dataIndex] },
          itemStyle: { color: (params: any) => lineColors[params.dataIndex] },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: amounts.map((value, index) => ({
                offset: index / (amounts.length - 1),
                color: lineColors[index]
              }))
            }
          },
          markPoint: {
            data: markPoints,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'elasticOut'
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

  onGroupingLogicChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.value;

    // Call initChart with the selected grouping logic
    this.initChart(this.records, selectedOption);
  }

  onReload(groupingDropdown: HTMLSelectElement): void {
    // Reset the dropdown to the first option
    groupingDropdown.value = 'calendarYear';

    // Reload the chart with the default grouping logic
    this.initChart(this.records, 'calendarYear');
  }

  initChartByCalendarYear(data: { month: string; year: number; amount: number }[]): void {
    // Group data by calendar year
    const groupedData: { year: number; amount: number }[] = [];
    const yearMap = new Map<number, number>();

    data.forEach((record) => {
      if (!yearMap.has(record.year)) {
        yearMap.set(record.year, 0);
      }
      yearMap.set(record.year, yearMap.get(record.year)! + record.amount);
    });

    yearMap.forEach((amount, year) => {
      groupedData.push({ year, amount });
    });

    // Transform grouped data into the format required by the chart
    const transformedData = groupedData.map((record) => ({
      month: 'Year Total',
      year: record.year,
      amount: record.amount
    }));

    // Call the original chart method with transformed data
    this.initChart(transformedData);
  }

  initChartByRollingFromStart(data: { month: string; year: number; amount: number }[]): void {
    // Group data into rolling 12-month periods starting from the first month
    const rollingData: { month: string; year: number; amount: number }[] = [];
    for (let i = 0; i <= data.length - 12; i++) {
      const period = data.slice(i, i + 12);
      const totalAmount = period.reduce((sum, record) => sum + record.amount, 0);
      rollingData.push({
        month: period[0].month,
        year: period[0].year,
        amount: totalAmount
      });
    }

    // Call the original chart method with rolling data
    this.initChart(rollingData);
  }

  initChartByRollingFromEnd(data: { month: string; year: number; amount: number }[]): void {
    // Group data into rolling 12-month periods starting from the last month
    const rollingData: { month: string; year: number; amount: number }[] = [];
    for (let i = data.length - 12; i >= 0; i--) {
      const period = data.slice(i, i + 12);
      const totalAmount = period.reduce((sum, record) => sum + record.amount, 0);
      rollingData.push({
        month: period[0].month,
        year: period[0].year,
        amount: totalAmount
      });
    }

    // Reverse the rolling data to maintain chronological order
    rollingData.reverse();

    // Call the original chart method with rolling data
    this.initChart(rollingData);
  }
}
