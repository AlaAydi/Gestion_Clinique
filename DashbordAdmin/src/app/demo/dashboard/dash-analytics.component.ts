// angular import
import { Component, OnInit, ViewChild } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ProductSaleComponent } from './product-sale/product-sale.component';

// service
import { DashboardService } from 'src/app/core/services/admin/dashboard.service';

// 3rd party import
import { ApexOptions, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-dash-analytics',
  standalone: true,
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './dash-analytics.component.html',
  styleUrls: ['./dash-analytics.component.scss']
})
export default class DashAnalyticsComponent implements OnInit {

  // charts refs
  @ViewChild('chart') chart!: ChartComponent;
  @ViewChild('customerChart') customerChart!: ChartComponent;

  chartOptions!: Partial<ApexOptions>;
  chartOptions_1!: Partial<ApexOptions>;
  chartOptions_2!: Partial<ApexOptions>;
  chartOptions_3!: Partial<ApexOptions>;

  // cards
  cards: any[] = [];

  images = [
    {
      src: 'assets/images/gallery-grid/img-grd-gal-1.jpg',
      title: 'Old Scooter',
      size: 'PNG-100KB'
    },
    {
      src: 'assets/images/gallery-grid/img-grd-gal-2.jpg',
      title: 'Wall Art',
      size: 'PNG-150KB'
    },
    {
      src: 'assets/images/gallery-grid/img-grd-gal-3.jpg',
      title: 'Microphone',
      size: 'PNG-150KB'
    }
  ];

  constructor(private dashboardService: DashboardService) {
    this.initCharts();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  // ===============================
  // API CALL
  // ===============================
  loadDashboardData() {
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => {
        this.updateCards(data);
        this.updateCharts(data);
      },
      error: (err) => {
        console.error('Dashboard API error', err);
      }
    });
  }

  // ===============================
  // UPDATE CARDS
  // ===============================
updateCards(data: any) {
  const overview = data.overview;

  this.cards = [
    {
      background: 'bg-c-blue',
      title: 'Total Patients',
      icon: 'icon-users',
      text: 'Active / Inactive',
      number: overview.total_patients,
      no: `${overview.active_patients} / ${overview.inactive_patients}`
    },
    {
      background: 'bg-c-green',
      title: 'Total Doctors',
      icon: 'icon-user-md',
      text: 'Approved / Pending',
      number: overview.total_doctors,
      no: `${overview.approved_doctors} / ${overview.pending_doctors}`
    },
    {
      background: 'bg-c-yellow',
      title: 'Total Consultations',
      icon: 'icon-notebook',
      text: 'This Month',
      number: data.consultations.this_month,
      no: ''
    },
    {
      background: 'bg-c-red',
      title: 'Upcoming Consultations',
      icon: 'icon-clock',
      text: 'Next Appointments',
      number: data.consultations.upcoming,
      no: ''
    }
  ];
}


  // ===============================
  // UPDATE CHARTS
  // ===============================
 updateCharts(data: any) {
  // Donut chart: consultations by specialty
  const specialtyCounts = data.consultations_by_specialty.map((c: any) => c.count);
  const specialtyLabels = data.consultations_by_specialty.map((c: any) => c.specialty);

  this.chartOptions_1.series = specialtyCounts;
  this.chartOptions_1.labels = specialtyLabels;

  this.chartOptions_2.series = specialtyCounts;
  this.chartOptions_2.labels = specialtyLabels;

  // Si tu veux un line chart des consultations (today, this_week, this_month)
  this.chartOptions.series = [
    {
      name: 'Consultations',
      data: [data.consultations.today, data.consultations.this_week, data.consultations.this_month]
    }
  ];
  this.chartOptions.xaxis = {
    categories: ['Today', 'This Week', 'This Month']
  };
}

  // ===============================
  // INIT CHARTS (STATIC CONFIG)
  // ===============================
  initCharts() {

    this.chartOptions = {
      chart: {
        height: 205,
        type: 'line',
        toolbar: { show: false }
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      series: [],
      legend: { position: 'top' },
      xaxis: { categories: [] },
      yaxis: { min: 0 },
      colors: ['#73b4ff', '#59e0c5'],
      grid: { borderColor: '#cccccc3b' }
    };

    this.chartOptions_1 = {
      chart: { height: 150, type: 'donut' },
      labels: ['New', 'Return'],
      series: [],
      legend: { show: false },
      dataLabels: { enabled: false },
      colors: ['#4680ff', '#2ed8b6']
    };

    this.chartOptions_2 = {
      chart: { height: 150, type: 'donut' },
      labels: ['New', 'Return'],
      series: [],
      legend: { show: false },
      dataLabels: { enabled: false },
      colors: ['#fff', '#2ed8b6']
    };

    this.chartOptions_3 = {
      chart: {
        type: 'area',
        height: 145,
        sparkline: { enabled: true }
      },
      series: [{ data: [45, 35, 60, 50, 85, 70] }],
      stroke: { curve: 'smooth', width: 2 },
      colors: ['#ff5370']
    };
  }
}
