import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { RestApiService } from '../../../services/api/rest-api.service';
import { TranslateService } from '@ngx-translate/core';
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
    public auth: AuthService,
    public translate: TranslateService
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
      title: this.translate.instant('POPUPS.APPROVE_BOOKING_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.APPROVE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.post(`booking/confirm-booking`, {booking_id: bookingId})
          .then((response: any) => {
            this.sp.hide();
            Swal.fire(this.translate.instant('LIST.MY_BOOKINGS'), this.translate.instant('POPUPS.APPROVED_SUCCESSFULLY'), "success");
            this.getAllBookings();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_APPROVE_BOOKING'));
          });
      }
    });
  }

  cancelBooking(bookingId: any) {
    this.helper.failureToast('Booking already paid and can not be cancellled.');
    // Swal.fire({
    //   title: "Are you sure you want to cancel this booking?",
    //   input: 'textarea',
    //   inputLabel: 'Cancellation Reason',
    //   inputPlaceholder: 'Enter reason for cancellation...',
    //   showDenyButton: true,
    //   showCancelButton: false,
    //   confirmButtonText: "Reject",
    //   denyButtonText: `Cancel`,
    //   inputValidator: (value) => {
    //     if (!value) {
    //       return 'You need to provide a reason for cancellation!';
    //     }
    //     return null;
    //   }
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     this.sp.show();
    //     const data = { booking_id: bookingId, cancellation_reason: result.value };
    //     this.api.post(`booking/cancel-booking`, data)
    //       .then((response: any) => {
    //         this.sp.hide();
    //         Swal.fire("Booking!", "Cancellation Successfully", "success");
    //         this.getAllBookings();
    //       })
    //       .catch((error: any) => {
    //         this.sp.hide();
    //         this.helper.failureToast(error?.error?.message || 'Failed to cancel booking');
    //       });
    //   }
    // });
  }

  rejectBooking(bookingId: any) {
  Swal.fire({
    title: this.translate.instant('POPUPS.REJECT_BOOKING_TITLE'),
    input: 'textarea',
    inputLabel: this.translate.instant('POPUPS.REJECTION_REASON'),
    inputPlaceholder: this.translate.instant('POPUPS.ENTER_REJECTION_REASON'),
    showDenyButton: true,
    showCancelButton: false,
    confirmButtonText: this.translate.instant('COMMON.REJECT'),
    denyButtonText: this.translate.instant('COMMON.CANCEL'),
    inputValidator: (value) => {
      if (!value) {
        return this.translate.instant('POPUPS.REJECTION_REASON_REQUIRED');
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
          Swal.fire(this.translate.instant('LIST.MY_BOOKINGS'), this.translate.instant('POPUPS.REJECTED_SUCCESSFULLY'), "success");
          this.getAllBookings();
        })
        .catch((error: any) => {
          this.sp.hide();
          // Don't logout on non-401 errors
          if (error?.status === 401) {
            // Session expired - handleUnauthorized will handle logout
            return;
          }
          this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_REJECT_BOOKING'));
        });
    }
  });
}
}
