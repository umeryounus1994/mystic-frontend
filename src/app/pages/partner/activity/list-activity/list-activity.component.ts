import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-list-activity',
  templateUrl: './list-activity.component.html',
  styleUrl: './list-activity.component.scss'
})
export class ListActivityComponent implements OnInit {
  Math = Math;
  
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false,
    paging: false,
    info: false,
    searching: false
  };

  allActivities: any = [];
  selectedActivity: any = {};
  categories = [
    { value: '', label: 'All Categories' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'educational', label: 'Educational' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'others', label: 'Others' }
  ];
  
  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'inactive', label: 'Inactive' }
  ];

  filters = {
    category: '',
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
    public router: Router,
    public auth: AuthService,
    public translate: TranslateService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async ngOnInit() {
    this.sp.show();
    await this.getAllActivities();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

async getAllActivities() {
    this.allActivities = [];
    
    const queryParams = new URLSearchParams();
    if (this.filters.category) queryParams.append('category', this.filters.category);
    if (this.filters.status) queryParams.append('status', this.filters.status);
    queryParams.append('page', this.filters.page.toString());
    queryParams.append('limit', this.filters.limit.toString());
    
        // Add partner_id only if user is a partner
    if (this.auth.isPartner) {
      queryParams.append('partner_id', this.auth.user._id.toString());
    }

    const endpoint = `activity/?${queryParams.toString()}`;
    
    this.api.get(endpoint)
      .then((response: any) => {
        this.sp.hide();
        this.allActivities = response?.data?.activities || [];
        this.pagination = response?.data?.pagination || this.pagination;
      }).catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Failed to load activities');
      });
}

  onFilterChange() {
    this.filters.page = 1;
    this.getAllActivities();
  }

  onPageChange(page: number) {
    this.filters.page = page;
    this.sp.show();
    this.getAllActivities();
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  viewActivity(activity: any) {
    this.router.navigate(['/partner/view-activity'], { queryParams: { activityId: activity._id } });
  }

  editActivity(activityId: any) {
    this.router.navigate(['/partner/edit-activity'], { queryParams: { activityId: activityId } });
  }

deleteActivity(activityId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.DELETE_ACTIVITY_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete(`activity/${activityId}`)
          .then((response: any) => {
            this.sp.hide();
            Swal.fire(this.translate.instant('SIDEBAR.ACTIVITIES'), this.translate.instant('MESSAGES.DELETED_SUCCESS'), "success");
            this.getAllActivities();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_DELETE_ACTIVITY'));
          });
      }
    });
  }

  approveActivity(activityId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.APPROVE_ACTIVITY_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.APPROVE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.post(`activity/${activityId}/approve`, {})
          .then((response: any) => {
            this.sp.hide();
            Swal.fire(this.translate.instant('SIDEBAR.ACTIVITIES'), this.translate.instant('POPUPS.APPROVED_SUCCESSFULLY'), "success");
            this.getAllActivities();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_APPROVE_ACTIVITY'));
          });
      }
    });
  }

  rejectActivity(activityId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.REJECT_ACTIVITY_TITLE'),
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
        const data = {
          rejection_reason: result.value
        };
        this.api.post(`activity/${activityId}/reject`, data)
          .then((response: any) => {
            this.sp.hide();
            Swal.fire(this.translate.instant('SIDEBAR.ACTIVITIES'), this.translate.instant('POPUPS.REJECTED_SUCCESSFULLY'), "success");
            this.getAllActivities();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_REJECT_ACTIVITY'));
          });
      }
    });
  }

  updateActivityStatus(activityId: any, status: string) {
    this.sp.show();
    const data = {
      status: status
    };
    this.api.patch(`activity/${activityId}`, data)
      .then((response: any) => {
        this.sp.hide();
        const statusText = status === 'approved' ? this.translate.instant('COMMON.APPROVED') : this.translate.instant('COMMON.REJECTED');
        Swal.fire(this.translate.instant('SIDEBAR.ACTIVITIES'), `${statusText} ${this.translate.instant('MESSAGES.SUCCESS')}`, "success");
        this.getAllActivities();
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || `Failed to ${status} activity`);
      });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'rejected': return 'bg-danger';
      case 'draft': return 'bg-secondary';
      case 'inactive': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'outdoor': return 'bi-tree';
      case 'indoor': return 'bi-house';
      case 'educational': return 'bi-book';
      case 'sports': return 'bi-trophy';
      case 'arts': return 'bi-palette';
      case 'adventure': return 'bi-compass';
      case 'others': return 'bi-tag';
      default: return 'bi-tag';
    }
  }
}
