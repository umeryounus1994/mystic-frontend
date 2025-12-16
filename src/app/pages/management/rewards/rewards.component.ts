import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-rewards',
  templateUrl: './rewards.component.html',
  styleUrl: './rewards.component.scss'
})
export class RewardsComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };

  allUsers : any = [];
  reward: File | undefined = undefined;


  constructor(
    private sp: NgxSpinnerService, 
    private api: RestApiService, 
    private helper: HelperService,
    private router: Router,
    public translate: TranslateService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }
  async ngOnInit() {
    this.sp.show()
    await this.getAllUsers();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  async getAllUsers() {
    this.allUsers = [];
    this.api.get('drop/get_all_rewards')
    .then((response: any) => {
        this.sp.hide();
        this.allUsers = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }
  showDetails(m: any){
    $("#viewQuest").modal('show');
    $("#drop_name").html(m?.reward_name)
    $("#drop_description").html(m?.reward_file)
  }
  deletee(userId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.DELETE_REWARD_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {

      this.sp.show();
      let data = {
        status: 'deleted'
      };
        this.api.patch('drop/updateReward/'+userId, data)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire(this.translate.instant('SIDEBAR.REWARDS'), this.translate.instant('MESSAGES.DELETED_SUCCESS'), "success");
         this.getAllUsers()
        }, err => {
          this.helper.failureToast(err?.error?.message);
          this.sp.hide();
        });
      } else if (result.isDenied) {
       // Swal.fire("Exam not deleted", "", "info");
      }
    });
  }
  showRewardDialog(){
    $("#addProfession").modal("show");
    $('#reward_limit').val('')
    $('#reward_crypes').val('')
  }
    _SaveRequest() {
    this.sp.show();
    let fd= new FormData();
    fd.append('reward_limit', $('#reward_limit').val())
    fd.append('reward_crypes', $('#reward_crypes').val())
    if(this.reward){
      fd.append('reward_file', this.reward!, this.reward?.name);
    }
    
    this.api.postImageData('drop/createDropReward/', fd)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast(this.translate.instant('REWARDS.ADDED_SUCCESSFULLY'));
            $("#addProfession").modal("hide");
            $('#reward_limit').val('')
            $('#reward_crypes').val('')
            this.getAllUsers();
          }, 1000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire(this.translate.instant('SIDEBAR.REWARDS'), this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }
  onFileSelected(event: any, type: string) {
      this.reward = event.target.files[0];
  }
}

