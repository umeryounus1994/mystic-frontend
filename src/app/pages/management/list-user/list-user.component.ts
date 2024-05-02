import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.scss'
})
export class ListUserComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };
  counters = {
    allExams: 0,
    publishedExams: 0,
    draftExams: 0,
    closedExams: 0,
    reviewExams: 0
  }

  allUsers : any = [];
  examId = null;


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
    this.allUsers = [];
    this.api.get('user/get_all')
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
}
