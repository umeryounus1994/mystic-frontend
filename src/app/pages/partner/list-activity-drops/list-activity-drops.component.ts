import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-activity-drops',
  templateUrl: './list-activity-drops.component.html',
  styleUrl: './list-activity-drops.component.scss'
})
export class ListActivityDropsComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };

  allActivityDrops: any = [];

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
    await this.getAllActivityDrops();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async getAllActivityDrops() {
    this.allActivityDrops = [];
    this.api.get('activity-drop/all')
      .then((response: any) => {
        this.sp.hide();
        this.allActivityDrops = response?.data || [];
      }).catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Failed to load activity drops');
      });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  viewActivityDrop(drop: any) {
    $("#viewActivityDrop").modal('show');
    $("#drop_name").html(drop?.drop_name);
    $("#drop_description").html(drop?.drop_description);
    $("#activity_title").html(drop?.activity_id?.title || 'N/A');
    $("#drop_location").html(`Lat: ${drop?.location?.coordinates[1]}, Lng: ${drop?.location?.coordinates[0]}`);
  }

  editActivityDrop(dropId: any) {
    this.router.navigate(['/partner/edit-activity-drop'], { queryParams: { dropId: dropId } });
  }

  deleteActivityDrop(dropId: any) {
    Swal.fire({
      title: `Are you sure you want to delete this Activity Drop?`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete('activity-drop/' + dropId)
          .then((response: any) => {
            this.sp.hide();
            Swal.fire("Activity Drop!", "Deleted Successfully", "success");
            this.getAllActivityDrops();
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || 'Failed to delete activity drop');
          });
      }
    });
  }
}
