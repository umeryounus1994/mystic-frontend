import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';
declare var $: any;

@Component({
  selector: 'app-list-skygifts',
  templateUrl: './list-skygifts.component.html',
  styleUrl: './list-skygifts.component.scss'
})
export class ListSkygiftsComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };

  allSkyGifts: any = [];
  selectedGift: any = {}; 

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
    if(this.auth.isAdmin){
      await this.getAllSkyGifts();
    } else {
      await this.getAllSkyGiftsSubAdmin();
    }
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async getAllSkyGifts() {
    this.allSkyGifts = [];
    this.api.get('skyGift/all')
    .then((response: any) => {
        this.sp.hide();
        this.allSkyGifts = response?.data?.gifts;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }

  async getAllSkyGiftsSubAdmin() {
    this.allSkyGifts = [];
    this.api.get('skyGift/get_all_subadmin')
    .then((response: any) => {
        this.sp.hide();
        this.allSkyGifts = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  viewSkyGift(gift: any) {
    $("#viewSkyGift").modal("show");
    this.selectedGift = gift;
    $("#gift_name").html(gift?.gift_name);
    $("#gift_description").html(gift?.gift_description);
    $("#mythica_reward").html(gift?.mythica_reward?.creature_name);
    $("#location").html(`${gift?.location?.coordinates[1]}, ${gift?.location?.coordinates[0]}`);
    $("#status").html(gift?.status);
  }

  edit(giftId: any) {
    this.router.navigate(['/skygifts/edit-skygifts'], { queryParams: { giftId: giftId} });
  }

  deletee(giftId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.DELETE_SKY_GIFT_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete('skygift/delete/'+giftId)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire(this.translate.instant('SIDEBAR.SKY_GIFTS'), this.translate.instant('MESSAGES.DELETED_SUCCESS'), "success");
          // Refresh list based on user type
          if(this.auth.isAdmin){
            this.getAllSkyGifts();
          } else {
            this.getAllSkyGiftsSubAdmin();
          }
        }, err => {
          this.sp.hide();
          // Don't logout on non-401 errors
          if (err?.status === 401) {
            // Session expired - handleUnauthorized will handle logout
            return;
          }
          this.helper.failureToast(err?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_DELETE_GIFT'));
        });
      }
    });
  }
}
