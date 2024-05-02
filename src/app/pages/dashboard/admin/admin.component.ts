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
    treasurehunts: 0
  }
  constructor(private sp: NgxSpinnerService, private api: RestApiService) {
  }
  async ngOnInit() {
    //this.sp.show()
    // await this.getQuestionsCharts();
    // await this.getCategoriesCharts();
    // await this.getAllCount();
  }
  async getQuestionsCharts() {
    this.api.get('Analyst/getQuestions')
      .then((response: any) => {
        if (response.status === "Success") {
          this.sp.hide();
          this.QuestionsChart = new Chart("QuestionsChart", {
            type: 'bar',

            data: {
              labels: response?.data?.details?.labels,
              datasets: [
                {
                  label: "Questions",
                  data: response?.data?.details?.questionsData,
                  backgroundColor: 'lightskyblue'
                },
              ]
            },
            options: {
             // aspectRatio: 2.5,
                  maintainAspectRatio: false,
    responsive: true,  
            }

          });
        }
      }).catch((error: any) => {
        this.sp.hide();
      });
  }
  async getCategoriesCharts() {
    this.api.get('Analyst/getExamCategories')
      .then((response: any) => {
        if (response.status === "Success") {
          this.sp.hide();
          this.CategoriesChart = new Chart("CategoriesChart", {
            type: 'pie',

            data: {
              labels: response?.data?.details?.labels,
              datasets: [{
                //label: response?.data?.details?.examsData,
                data: response?.data?.details?.examsData,
                hoverOffset: 4
              }],
            },
            
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  
                },
              
              }
            },

          });
        }
      }).catch((error: any) => {
        this.sp.hide();
      });
  }
  async getAllCount() {
    this.api.get('Analyst/GetAll')
      .then((response: any) => {
        this.counters = response.data;
        this.sp.hide();
      }).catch((error: any) => {
        this.sp.hide();
      });
  }

}
