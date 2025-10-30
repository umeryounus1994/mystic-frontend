import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { HelperService } from '../../../services/helper/helper.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-partner-dashboard',
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss'
})
export class PartnerDashboardComponent implements OnInit {
  stats: any = {
    activities: {
      total: 0,
      active: 0,
      pending: 0,
      rejected: 0
    },
    bookings: {
      total: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    },
    revenue: {
      totalRevenue: 0,
      partnerEarnings: 0,
      commissionPaid: 0,
      monthlyEarnings: 0
    }
  };

  recentActivities: any[] = [];
  recentBookings: any[] = [];
  monthlyRevenueChart: any;
  activitiesStatusChart: any;

  constructor(
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private router: Router,
    private helper: HelperService
  ) {}

  async ngOnInit() {
    this.sp.show();
    await this.getPartnerStats();
    this.sp.hide();
    
    // Initialize charts after data is loaded
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }

  async getPartnerStats() {
    try {
      const response: any = await this.api.get('activity/dashboard-stats');
      if (response?.data) {
        this.stats = response.data;
        this.recentActivities = response.data.recentActivities || [];
        this.recentBookings = response.data.recentBookings || [];
      }
    } catch (error: any) {
      this.helper.failureToast(error?.error?.message || 'Failed to load stats');
    }
  }

  initializeCharts() {
    this.createRevenueChart();
    this.createActivitiesStatusChart();
  }

  createRevenueChart() {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (ctx) {
      // Sample monthly data - you can replace with actual monthly data from API
      const monthlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, this.stats.revenue.monthlyEarnings];
      
      this.monthlyRevenueChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Monthly Earnings ($)',
            data: monthlyData,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          }
        }
      });
    }
  }

  createActivitiesStatusChart() {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (ctx) {
      this.activitiesStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Pending', 'Rejected'],
          datasets: [{
            data: [
              this.stats.activities.active,
              this.stats.activities.pending,
              this.stats.activities.rejected
            ],
            backgroundColor: ['#198754', '#ffc107', '#dc3545'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  navigateToActivities() {
    this.router.navigate(['/partner/list-activities']);
  }

  navigateToCreateActivity() {
    this.router.navigate(['/partner/create-activity']);
  }

  viewActivity(activityId: string) {
    this.router.navigate(['/partner/view-activity'], { queryParams: { activityId } });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-danger';
      case 'draft':
        return 'bg-secondary';
      default:
        return 'bg-light text-dark';
    }
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  navigateToBookings() {
    this.router.navigate(['/partner/bookings']);
  }

  ngOnDestroy() {
    if (this.monthlyRevenueChart) {
      this.monthlyRevenueChart.destroy();
    }
    if (this.activitiesStatusChart) {
      this.activitiesStatusChart.destroy();
    }
  }
}
