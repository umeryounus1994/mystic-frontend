import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var $: any;


@Component({
  selector: 'app-list-mysteries',
  templateUrl: './list-mysteries.component.html',
  styleUrl: './list-mysteries.component.scss'
})
export class ListMysteriesComponent implements OnInit {
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
  mysteryImage = '';


  constructor(private sp: NgxSpinnerService, private api: RestApiService, private helper: HelperService,
    private router: Router) {
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
    this.allQuests = [];
    this.api.get('pictureMystery/get_all_admin')
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
  
  edit(Id: any) {
    this.router.navigate(['mystery/edit-mystery'], { queryParams: { Id: Id} });
  }
  
  deleteExamModal(userId: any, status: any) {
    Swal.fire({
      title: `Are you sure You want to delete this Mystery?`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {

      this.sp.show();

        this.api.delete('pictureMystery/'+userId)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("Mystery!", "Deleted Successfully", "success");
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
  viewQuest(quest: any){
    $("#viewQuest").modal("show");
    $("#question").html(quest.picture_mystery_question)
    $("#title").html(quest.quest_title)
    $("#no_of_xp").html(quest.no_of_xp)
    $("#no_of_crypes").html(quest.no_of_crypes)
    $("#level_increase").html(quest.level_increase)
    this.mythicaURL = quest.mythica;
    this.questions = quest.options;
    this.mysteryImage = quest?.picture_mystery_question_url
  }
}

