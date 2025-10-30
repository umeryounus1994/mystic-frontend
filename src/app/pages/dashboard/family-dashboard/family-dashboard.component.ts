import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { RestApiService } from '../../../services/api/rest-api.service';

@Component({
  selector: 'app-family-dashboard',
  templateUrl: './family-dashboard.component.html',
  styleUrl: './family-dashboard.component.scss'
})
export class FamilyDashboardComponent implements OnInit {
  
  stats: any = {
    bookings: {
      total: 0,
      confirmed: 0,
      pending: 0,
      completed: 0,
      cancelled: 0
    },
    spending: {
      totalSpent: 0,
      averagePerBooking: 0
    }
  };

  recentBookings: any[] = [];
  upcomingBookings: any[] = [];

  constructor(
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private router: Router,
    private helper: HelperService
  ) {}

  async ngOnInit() {
    this.sp.show();
    await this.getFamilyDashboard();
    this.sp.hide();
  }

  async getFamilyDashboard() {
    try {
      const response: any = await this.api.get('user/family-dashboard');
      if (response?.data) {
        this.stats = response.data;
        this.recentBookings = response.data.recentBookings || [];
        this.upcomingBookings = response.data.upcomingBookings || [];
      }
    } catch (error: any) {
      this.helper.failureToast(error?.error?.message || 'Failed to load dashboard');
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-success';
      case 'completed': return 'bg-info';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  viewAllBookings() {
    this.router.navigate(['/bookings/list-bookings']);
  }

  viewBookingDetails(bookingId: string) {
    this.router.navigate(['/booking/list-bookings'], { queryParams: { id: bookingId } });
  }

  viewActivityDetails(activityId: string) {
    this.router.navigate(['/partner/view-activity'], { queryParams: { activityId: activityId } });
  }
}
