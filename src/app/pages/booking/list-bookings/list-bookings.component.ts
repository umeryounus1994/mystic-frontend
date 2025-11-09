import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { RestApiService } from '../../../services/api/rest-api.service';
import Swal from 'sweetalert2';

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
    paging: true,
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

    let endpoint;
    if (this.auth.isAdmin) {
      endpoint = `booking/admin/all-bookings?${queryParams.toString()}`;
    } else if (this.auth.isPartner) {
      endpoint = `booking/partner/my-bookings?${queryParams.toString()}`;
    } else {
      endpoint = `booking/my-bookings?${queryParams.toString()}`;
    }
    
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

  getBookingStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-success';
      case 'completed': return 'bg-info';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'failed': return 'bg-danger';
      case 'refunded': return 'bg-info';
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

  approveBooking(bookingId: any) {
    Swal.fire({
      title: "Are you sure you want to approve this booking?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Approve",
      denyButtonText: `Cancel`
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.post(`booking/confirm-booking`, {booking_id: bookingId})
          .then((response: any) => {
            this.sp.hide();
            Swal.fire("Booking!", "Approved Successfully", "success");
            this.getAllBookings();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || 'Failed to approve booking');
          });
      }
    });
  }

  cancelBooking(bookingId: any) {
    Swal.fire({
      title: "Are you sure you want to cancel this booking?",
      input: 'textarea',
      inputLabel: 'Cancellation Reason',
      inputPlaceholder: 'Enter reason for cancellation...',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Reject",
      denyButtonText: `Cancel`,
      inputValidator: (value) => {
        if (!value) {
          return 'You need to provide a reason for cancellation!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        const data = { booking_id: bookingId, cancellation_reason: result.value };
        this.api.post(`booking/cancel-booking`, data)
          .then((response: any) => {
            this.sp.hide();
            Swal.fire("Booking!", "Cancellation Successfully", "success");
            this.getAllBookings();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || 'Failed to cancel booking');
          });
      }
    });
  }

  rejectBooking(bookingId: any) {
  Swal.fire({
    title: "Are you sure you want to reject this booking?",
    input: 'textarea',
    inputLabel: 'Rejection Reason',
    inputPlaceholder: 'Enter reason for rejection...',
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: "Reject",
    denyButtonText: `Cancel`,
    inputValidator: (value) => {
      if (!value) {
        return 'You need to provide a reason for rejection!';
      }
      return null;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      this.sp.show();
      const data = { rejection_reason: result.value };
      this.api.post(`booking/${bookingId}/reject`, data)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("Booking!", "Rejected Successfully", "success");
          this.getAllBookings();
        })
        .catch((error: any) => {
          this.sp.hide();
          this.helper.failureToast(error?.error?.message || 'Failed to reject booking');
        });
    }
  });
}
}
