import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../../services/api/rest-api.service';
import { AuthService } from '../../../services/auth/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
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
    hunts: 0,
    activities: 0,
    partners: 0,
    pendingActivities: 0
  }
  constructor(
    private sp: NgxSpinnerService, 
    private api: RestApiService,
    public translate: TranslateService
  ) {
  }
  async ngOnInit() {
    this.sp.show();
    try {
      await this.getAnalytics();
    } finally {
      this.sp.hide();
    }
  }
  async getAnalytics() {
    try {
      const response: any = await this.api.get('user/analytics');
      this.counters = response.data;
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    }
  }

}
