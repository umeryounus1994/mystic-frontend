import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-drop',
  templateUrl: './list-drop.component.html',
  styleUrl: './list-drop.component.scss'
})
export class ListDropComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };
  counters = {
    users: 0,
    active: 0,
    inactive: 0
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
    this.api.get('drop/get_all')
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
    $("#drop_name").html(m?.drop_name)
    $("#drop_description").html(m?.drop_description)
    $("#mythica_reward").html(m?.mythica_reward?.creature_name)
    $("#mythica_ID").html(m?.mythica_ID?.creature_name)
  }
  deletee(userId: any) {
    Swal.fire({
      title: `Are you sure You want to delete this Drop?`,
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
        this.api.patch('drop/'+userId, data)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("Drop!", "Deleted Successfully", "success");
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
}
