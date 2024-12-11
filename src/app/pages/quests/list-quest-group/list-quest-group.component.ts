import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';
declare var $: any;

@Component({
  selector: 'app-list-quest-group',
  templateUrl: './list-quest-group.component.html',
  styleUrl: './list-quest-group.component.scss'
})
export class ListQuestGroupComponent implements OnInit {
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
    private router: Router, public auth:AuthService) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }
  ngOnInit() {
    this.sp.show()
      this.getAllUsers();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  getAllUsers() {
    this.allQuests = [];
    this.api.get('quest/get_all_quest_groups')
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
}