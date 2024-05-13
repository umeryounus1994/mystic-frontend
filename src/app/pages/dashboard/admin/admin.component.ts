import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../../services/api/rest-api.service';
import { AuthService } from '../../../services/auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  chartData: any;
  QuestionsChart: any;
  CategoriesChart: any;
  counters = {
    users: 0,
    missions: 0,
    quests: 0,
    hunts: 0
  }
  constructor(private sp: NgxSpinnerService, private api: RestApiService) {
  }
  async ngOnInit() {
    //this.sp.show()
    // await this.getQuestionsCharts();
    // await this.getCategoriesCharts();
    // await this.getAllCount();
    await this.getAnalytics();
  }
  async getAnalytics() {
    this.api.get('user/analytics')
      .then((response: any) => {
        this.counters = response.data;
      }).catch((error: any) => {
        this.sp.hide();
      });
  }

}
