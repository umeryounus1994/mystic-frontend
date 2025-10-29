import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { RestApiService } from '../../../services/api/rest-api.service';

declare var $: any;

@Component({
  selector: 'app-list-bookings',
  templateUrl: './list-bookings.component.html',
  styleUrl: './list-bookings.component.scss'
})
export class ListBookingsComponent implements OnInit {
  Math = Math;

  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false,
    paging: false,
    info: false,
    searching: false
  };

  allBookings: any = [];
  selectedBooking: any = {};
  
  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  filters = {
    status: '',
    page: 1,
    limit: 10
  };

  pagination = {
    current_page: 1,
    total_pages: 1,
    total_items: 0
  };

  constructor(
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService,
    private router: Router,
    public auth: AuthService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async ngOnInit() {
    this.sp.show();
    await this.getAllBookings();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async getAllBookings() {
    this.allBookings = [];
    
    const queryParams = new URLSearchParams();
    if (this.filters.status) queryParams.append('status', this.filters.status);
    queryParams.append('page', this.filters.page.toString());
    queryParams.append('limit', this.filters.limit.toString());

    const endpoint = `booking/my-bookings?${queryParams.toString()}`;
    
    this.api.get(endpoint)
      .then((response: any) => {
        this.sp.hide();
        this.allBookings = response?.data?.bookings || [];
        this.pagination = response?.data?.pagination || this.pagination;
      }).catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Failed to load bookings');
      });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
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

  viewBooking(booking: any) {
    this.selectedBooking = booking;
    $("#viewBooking").modal("show");
  }

  onFilterChange() {
    this.filters.page = 1;
    this.getAllBookings();
  }

  onPageChange(page: number) {
    this.filters.page = page;
    this.getAllBookings();
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.pagination.total_pages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
