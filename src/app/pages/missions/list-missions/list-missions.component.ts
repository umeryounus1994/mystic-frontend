import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-missions',
  templateUrl: './list-missions.component.html',
  styleUrl: './list-missions.component.scss'
})
export class ListMissionsComponent implements OnInit {

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
    this.api.get('mission/get_all_admin')
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
    $("#question").html(quest.mission_title)
    $("#no_of_xp").html(quest.no_of_xp)
    $("#no_of_crypes").html(quest.no_of_crypes)
    $("#level_increase").html(quest.level_increase)
    this.mythicaURL = quest.mythica_ID;
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
}
