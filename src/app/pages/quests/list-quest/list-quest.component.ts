import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';
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
  allQuestsGroups: any = [];
  qrCode: any = 'Hello';
  mythicaURL = '';
  mythicaModel = '';
  questId = '';
  quest_image = '';

  constructor(private sp: NgxSpinnerService, private api: RestApiService, private helper: HelperService,
    private router: Router, public auth:AuthService) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }
  ngOnInit() {
    this.sp.show() // Keep initial spinner
    if(this.auth.isAdmin || this.auth.isPartner){
      this.getAllUsers();
      this.getAllAnalytics();
      this.getAllGroups();
    }else {
      this.getAllUsersSubAdmin();
    }
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  getAllUsers() {
    this.allQuests = [];
    // Don't show spinner here - already showing from ngOnInit
    this.api.get('quest/get_all')
    .then((response: any) => {
        this.sp.hide(); // Hide spinner when main data is loaded
        this.allQuests = response?.data;
    }).catch((error: any) => {
      this.sp.hide(); // Hide spinner on error
    });
  }
  getAllUsersSubAdmin() {
    this.allQuests = [];
    // Don't show spinner here - already showing from ngOnInit
    this.api.get('quest/get_all_subadmin')
    .then((response: any) => {
        this.sp.hide(); // Hide spinner when main data is loaded
        this.allQuests = response?.data;
    }).catch((error: any) => {
      this.sp.hide(); // Hide spinner on error
    });
  }
  getAllGroups() {
    this.allQuestsGroups = [];
    // Remove spinner from here - runs in background
    this.api.get('quest/get_all_quest_groups')
    .then((response: any) => {
        this.allQuestsGroups = response?.data;
    }).catch((error: any) => {
      // Handle error silently for background calls
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
  assignGroup(id:any){
    this.questId = id;
    $("#assignGroup").modal("show");
  }
  assignGroupBtn(){
    const groupId = $("#groupId").val();
    if (!groupId) {
      Swal.fire("Error!", "Please select a quest group", "error");
      return;
    }
    
    // Validate group exists
    const groupExists = this.allQuestsGroups.some((g: any) => g.id === groupId || g._id === groupId);
    if (!groupExists) {
      Swal.fire("Error!", "Selected quest group does not exist", "error");
      return;
    }
    
    this.sp.show();
    const data = {
      quest_group_id: groupId,
      quest_id: this.questId
    }
    this.api.post('Quest/addQuestToGroup', data)
    .then((response: any) => {
      this.sp.hide();
      Swal.fire("Quest Group!", "Group Assigned Successfully", "success");
     this.getAllUsers()
     this.getAllAnalytics()
     $("#assignGroup").modal("hide");
    }, err => {
      this.helper.failureToast(err?.error?.message || 'Failed to assign group');
      this.sp.hide();
    });
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
    // Fix: Check multiple possible field names for answers
    this.questions = quest.options || quest.questions || quest.answers || quest.quiz || [];
    this.qrCode = quest.qr_code;
    this.quest_image = quest.quest_image
  }
  async getAllAnalytics() {
    // Remove spinner from here - runs in background
    this.api.get('quest/quest_analytics')
    .then((response: any) => {
        this.counters = response?.data;
    }).catch((error: any) => {
      // Handle error silently for background calls
    });
  }
}
