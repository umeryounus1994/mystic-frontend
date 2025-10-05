import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { AuthService } from '../../../services/auth/auth.service';
declare var $: any;
@Component({
  selector: 'app-list-mysterybags',
  templateUrl: './list-mysterybags.component.html',
  styleUrl: './list-mysterybags.component.scss'
})
export class ListMysterybagsComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers', 
    ordering: false
  };

  allMysteryBags: any = [];
  selectedBag: any = {};

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
    await this.getAllMysteryBags();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async getAllMysteryBags() {
    this.allMysteryBags = [];
    this.api.get('mysterybag/all')
    .then((response: any) => {
        this.sp.hide();
        this.allMysteryBags = response?.data?.bags;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  viewMysteryBag(bag: any) {
    $("#viewMysteryBag").modal("show");
    this.selectedBag = bag;
  }

  editMysteryBag(bagId: any) {
    this.router.navigate(['/mysterybag/edit-mysterybag'], { queryParams: { bagId: bagId} });
  }

  deleteMysteryBag(bagId: any) {
    Swal.fire({
      title: `Are you sure You want to delete this Mystery Bag?`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete('mysteryBag/delete/' + bagId)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("Mystery Bag!", "Deleted Successfully", "success");
          this.getAllMysteryBags();
        }, err => {
          this.helper.failureToast(err?.error?.message);
          this.sp.hide();
        });
      }
    });
  }
}
