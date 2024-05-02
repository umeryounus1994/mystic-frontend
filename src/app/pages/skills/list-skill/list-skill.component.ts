import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-skill',
  templateUrl: './list-skill.component.html',
  styleUrl: './list-skill.component.scss'
})
export class ListSkillComponent {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };

  allSkills : any = [];
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
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  async getAllUsers() {
    this.allSkills = [];
    this.api.get('skill/get_all')
    .then((response: any) => {
        this.sp.hide();
        this.allSkills = response?.data;
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
  deleteExam(){
    if($('#reason').val() == '' || $('#reason').val() == undefined) {
      this.helper.infoToast('Reason is required');
      return;
    }
    if($('#reason').val().length < 6) {
      this.helper.infoToast('Reason Length should be minimum 6 characters');
      return;
    }
    Swal.fire({
      title: "Are you sure You want to delete this Exam?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let deleteData = null;
        if($("#description").val() === ''){
          deleteData = {
            reason: $("#reason").val()
          };
        } else {
          deleteData = {
            reason: $("#reason").val(),
            description: $("#description").val()
          };
        }
      this.sp.show();
        this.api.deleteWithData('Exam/'+this.examId, deleteData)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("Exam!", "Deleted Successfully", "success");
         this.getAllUsers()
         $("#deleteExam").modal("hide");
        }, err => {
          this.helper.failureToast(err?.error?.message);
          this.sp.hide();
        });
      } else if (result.isDenied) {
       // Swal.fire("Exam not deleted", "", "info");
      }
    });
  }
  deleteExamModal(examId: any) {
    this.examId = examId;
    $("#deleteExam").modal("show");
  }
  viewQuest(quest: any){
    $("#viewQuest").modal("show");
    $("#skill_name").html(quest.skill_name)
    $("#skill_element").html(quest.skill_element)
    $("#skill_damage_value").html(quest.skill_damage_value);
  }
}
