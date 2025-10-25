import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-view-activity',
  templateUrl: './view-activity.component.html',
  styleUrl: './view-activity.component.scss'
})
export class ViewActivityComponent implements OnInit {
  activity: any = {};
  activityId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activityId = params['activityId'];
      if (this.activityId) {
        this.getActivityDetails();
      } else {
        this.router.navigate(['/partner/list-activities']);
      }
    });
  }

  getActivityDetails() {
    this.sp.show();
    this.api.get(`activity/${this.activityId}`)
      .then((response: any) => {
        this.sp.hide();
        this.activity = response?.data || {};
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Failed to load activity details');
        this.router.navigate(['/partner/list-activities']);
      });
  }

  editActivity() {
    this.router.navigate(['/partner/edit-activity'], { queryParams: { activityId: this.activityId } });
  }

deleteActivity() {
    Swal.fire({
      title: 'Are you sure you want to delete this activity?',
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete(`activity/${this.activityId}`)
          .then((response: any) => {
            this.sp.hide();
            Swal.fire("Activity!", "Deleted Successfully", "success");
            this.router.navigate(['/partner/list-activities']);
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || 'Failed to delete activity');
          });
      }
    });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
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

  getSlotStatusBadgeClass(status: string): string {
    switch (status) {
      case 'available': return 'bg-success';
      case 'full': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      case 'completed': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  goBack() {
    this.router.navigate(['/partner/list-activities']);
  }
  
}
