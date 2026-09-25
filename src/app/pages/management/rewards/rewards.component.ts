import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  isExploring = false;
  pageTitleKey = 'SIDEBAR.REWARDS';
  limitLabelKey = 'REWARDS.REWARD_LIMIT';
  limitPlaceholderKey = 'REWARDS.LIMIT';
  addedSuccessKey = 'REWARDS.ADDED_SUCCESSFULLY';
  exploringCities: string[] = [];
  selectedCity = '';
  private listEndpoint = 'drop/get_all_rewards';
  private createEndpoint = 'drop/createDropReward/';
  private updateEndpoint = 'drop/updateReward/';


  constructor(
    private sp: NgxSpinnerService, 
    private api: RestApiService, 
    private helper: HelperService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }
  async ngOnInit() {
    this.isExploring = this.route.snapshot.data?.['rewardType'] === 'exploring';
    if (this.isExploring) {
      this.pageTitleKey = 'EXPLORING_SPOTS.REWARDS';
      this.limitLabelKey = 'EXPLORING_SPOTS.SPOTS_REQUIRED';
      this.limitPlaceholderKey = 'EXPLORING_SPOTS.SPOTS_REQUIRED';
      this.addedSuccessKey = 'EXPLORING_SPOTS.REWARD_ADDED';
      this.listEndpoint = 'exploringSpot/rewards';
      this.createEndpoint = 'exploringSpot/createReward';
      this.updateEndpoint = 'exploringSpot/updateReward/';
    }
    this.sp.show()
    await this.getAllUsers();
    if (this.isExploring) {
      await this.loadCities();
    }
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  async loadCities() {
    try {
      const response: any = await this.api.get('exploringSpot/cities');
      this.exploringCities = response?.data || [];
    } catch {
      this.exploringCities = [];
    }
  }

  async getAllUsers() {
    this.allUsers = [];
    try {
      const response: any = await this.api.get(this.listEndpoint);
      this.sp.hide();
      this.allUsers = response?.data;
    } catch {
      this.sp.hide();
    }
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
        this.api.patch(this.updateEndpoint + userId, data)
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
    this.selectedCity = '';
    if (this.isExploring) {
      this.loadCities();
    }
    $("#addProfession").modal("show");
    $('#reward_limit').val('')
    $('#reward_crypes').val('')
  }
    _SaveRequest() {
    if (this.isExploring && !this.selectedCity) {
      this.helper.failureToast(this.translate.instant('EXPLORING_SPOTS.SELECT_CITY'));
      return;
    }
    this.sp.show();
    let fd= new FormData();
    fd.append('reward_limit', $('#reward_limit').val())
    fd.append('reward_crypes', $('#reward_crypes').val() || '0')
    if (this.isExploring) {
      fd.append('city', this.selectedCity)
      fd.append('spots_required', $('#reward_limit').val())
    }
    if(this.reward){
      fd.append('reward_file', this.reward!, this.reward?.name);
    }
    
    this.api.postImageData(this.createEndpoint, fd)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast(this.translate.instant(this.addedSuccessKey));
            $("#addProfession").modal("hide");
            $('#reward_limit').val('')
            $('#reward_crypes').val('')
            this.selectedCity = '';
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

  openExternalFile(fileUrl: string) {
    const url = String(fileUrl || '').trim();
    if (!url) {
      this.helper.infoToast('File not available');
      return;
    }
    if (this.isAndroidDevice() && this.isPdfFile(url)) {
      window.location.href = url;
      return;
    }
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  downloadExternalFile(fileUrl: string) {
    const url = String(fileUrl || '').trim();
    if (!url) {
      this.helper.infoToast('File not available');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private isPdfFile(url: string): boolean {
    return url.toLowerCase().includes('.pdf');
  }

  private isAndroidDevice(): boolean {
    return /android/i.test(navigator.userAgent || '');
  }
}

