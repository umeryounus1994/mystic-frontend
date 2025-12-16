import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { HelperService } from '../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';
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
    private helper: HelperService,
    public translate: TranslateService
  ) {}

  async ngOnInit() {
    this.sp.show();
    await this.getPartnerStats();
    await this.getEarningsSummary();
    this.sp.hide();
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

  async getEarningsSummary() {
    try {
      const response: any = await this.api.get('partner-earnings/summary');
      if (response?.data) {
        // Merge earnings data with existing revenue stats
        this.stats.revenue = {
          ...this.stats.revenue,
          totalEarnings: response.data.totalEarnings,
          pendingEarnings: response.data.pendingEarnings,
          monthlyEarnings: response.data.monthlyEarnings,
          totalBookings: response.data.totalBookings,
          averageEarningsPerBooking: response.data.averageEarningsPerBooking,
          commissionStats: response.data.commissionStats
        };
      }
    } catch (error: any) {
      console.error('Failed to load earnings summary:', error);
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
      case 'confirmed':
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
