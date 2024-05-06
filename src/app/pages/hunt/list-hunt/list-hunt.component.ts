import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
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
    this.allMissions = [];
    this.api.get('hunt/get_all_admin')
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
    $("#hunt_price").html(quest?.hunt_price);
    this.mythicaURL = quest.mythica_ID;
    this.quiz = [];
    this.quiz = quest.quiz;
    this.options = [];
    this.options = quest?.quiz?.options;
    this.missionId = quest?.id;
  }
  openModalQuizOption(id: any){
    $("#viewQuest").modal("hide");
    $("#addQuizOption").modal("show");
    this.missionQuizId = id;
  }
  addQuizOption() {
    if ($('#answer').val() == '' || $('#answer').val() == undefined) {
      this.helper.infoToast('Answer is required');
      return;
    }
    if ($('#correct_option').val() == '' || $('#correct_option').val() == undefined) {
      this.helper.infoToast('Correct Option is required');
      return;
    }
    const data = {
      answer: $('#answer').val(),
      correct_option: $('#correct_option').val(),
      treasure_hunt_id: this.missionId,
      treasure_hunt_quiz_id: this.missionQuizId
    };
    this.sp.show()
    this.api.post('hunt/createHuntOptions', data)
      .then(async (response: any) => {
        this.sp.hide()
        $('#addQuizOption').modal('hide');
        this.helper.successToast('Option Added Successfully');
        this.getAllUsers();
        $('#answer').val('')
        $('#correct_option').val('')
      }, err => {
        this.helper.failureToast(err?.error?.message);
        this.sp.hide();
      });
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
}