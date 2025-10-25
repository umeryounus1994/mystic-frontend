import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';
import { AuthService } from '../../../../services/auth/auth.service';
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
    { value: 'adventure', label: 'Adventure' }
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
    public auth: AuthService
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
      title: 'Are you sure you want to delete this activity?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete(`activity/${activityId}`)
          .then((response: any) => {
            this.sp.hide();
            Swal.fire("Activity!", "Deleted Successfully", "success");
            this.getAllActivities();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || 'Failed to delete activity');
          });
      }
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
      default: return 'bi-tag';
    }
  }
}
