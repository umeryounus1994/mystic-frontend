import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-quest',
  templateUrl: './list-quest.component.html',
  styleUrl: './list-quest.component.scss'
})
export class ListQuestComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };
  counters = {
    quests: 0,
    active: 0,
    deleted: 0
  }

  allQuests : any = [];
  examId = null;
  questions : any = [];
  qrCode: any = 'Hello';
  mythicaURL = '';
  mythicaModel = '';


  constructor(private sp: NgxSpinnerService, private api: RestApiService, private helper: HelperService,
    private router: Router) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }
  async ngOnInit() {
    this.sp.show()
    await this.getAllUsers();
    this.getAllAnalytics();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  async getAllUsers() {
    this.allQuests = [];
    this.api.get('quest/get_all')
    .then((response: any) => {
        this.sp.hide();
        this.allQuests = response?.data;
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
  
  deleteExamModal(userId: any) {
    Swal.fire({
      title: `Are you sure You want to delete this Quest?`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {

      this.sp.show();
      let data = {
        status: 'deleted'
      };
        this.api.patch('Quest/'+userId, data)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("Quest!", "Deleted Successfully", "success");
         this.getAllUsers()
         this.getAllAnalytics()
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
    this.router.navigate(['/quest/edit-quest'], { queryParams: { Id: Id} });
  }
  viewQuest(quest: any){
    $("#viewQuest").modal("show");
    $("#question").html(quest.quest_question)
    $("#title").html(quest.quest_title)
    $("#no_of_xp").html(quest.no_of_xp)
    $("#no_of_crypes").html(quest.no_of_crypes)
    $("#level_increase").html(quest.level_increase)
    this.mythicaURL = quest.mythica;
    this.mythicaModel = quest.mythica_model;
    this.questions = quest.options;
    this.qrCode = quest.qr_code;
  }
  async getAllAnalytics() {
    this.api.get('quest/quest_analytics')
    .then((response: any) => {
        this.sp.hide();
        this.counters = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }
}
