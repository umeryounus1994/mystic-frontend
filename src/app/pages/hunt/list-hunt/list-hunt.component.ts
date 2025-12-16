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
  selector: 'app-list-hunt',
  templateUrl: './list-hunt.component.html',
  styleUrl: './list-hunt.component.scss'
})
export class ListHuntComponent implements OnInit {

  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };

  allMissions : any = [];
  examId = null;
  questions : any = [];
  quiz : any = [];
  options: any = [];
  mythicaURL = '';
  mythicaModel = '';
  missionId='';
  missionQuizId='';
  qrCode: any = 'Hello';


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
  ngOnInit() {
    this.sp.show()
    if(this.auth.isAdmin){
      this.getAllUsers();
    }else {
      this.getAllUsersSubAdmin();
    }
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  getAllUsers() {
    this.allMissions = [];
    this.api.get('hunt/get_all_admin')
    .then((response: any) => {
        this.sp.hide();
        this.allMissions = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }
  getAllUsersSubAdmin() {
    this.allMissions = [];
    this.api.get('hunt/get_all_subadmin')
    .then((response: any) => {
        this.sp.hide();
        this.allMissions = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }
  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }
  editExam(examId: any){
    this.router.navigate(['/exam/edit-exam'], { queryParams: { examId: examId} });
  }

  viewQuest(quest: any){
    $("#viewQuest").modal("show");
    $("#question").html(quest.treasure_hunt_title)
    $("#no_of_xp").html(quest.no_of_xp)
    $("#no_of_crypes").html(quest.no_of_crypes)
    $("#level_increase").html(quest.level_increase)
    $("#premium_hunt").html(quest?.premium_hunt == true ? "Yes": "No")
    $("#hunt_package").html(quest?.hunt_package);
    this.mythicaURL = quest.mythica_ID;
    this.qrCode = quest.qr_code;
    this.quiz = [];
    this.quiz = quest.quiz;
    this.options = [];
    this.options = quest?.quiz?.options;
    this.missionId = quest?.id;
  }
  toggleOptions(quizId: string): void {
    const quizOptionsId = 'quizOptions' + quizId;
    const quizOptionsElement = document.getElementById(quizOptionsId);

    if (quizOptionsElement?.classList.contains('show')) {
      quizOptionsElement.classList.remove('show');
    } else {
      quizOptionsElement?.classList.add('show');
    }
  }
  deletee(userId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.DELETE_HUNT_TITLE'),
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
        this.api.patch('hunt/'+userId, data)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire(this.translate.instant('SIDEBAR.TREASURE_HUNTS'), this.translate.instant('MESSAGES.DELETED_SUCCESS'), "success");
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
  edit(Id: any) {
    this.router.navigate(['/hunt/edit-hunt'], { queryParams: { Id: Id} });
  }
}