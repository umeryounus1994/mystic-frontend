import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-missions',
  templateUrl: './create-missions.component.html',
  styleUrl: './create-missions.component.scss'
})
export class CreateMissionsComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.questForm = this.fb.group({
      mission_title: ['', [Validators.required, Validators.minLength(5)]],
      no_of_xp: ['', Validators.required],
      no_of_crypes: ['', Validators.required],
      level_increase: ['', Validators.required],
      mythica_ID: ['', Validators.required],
      mission_latitude: ['', Validators.required],
      mission_longitude: ['', Validators.required],
      mission_start_date: ['', Validators.required],
      mission_end_date: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.addQuestion();
    this.addQuestion();
    this.addQuestion();
    this.getAllCreatures()
  }
  async getAllCreatures() {
    this.allCreatures = [];
    this.api.get('creature/get_all')
    .then((response: any) => {
        this.sp.hide();
        this.allCreatures = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }
  get f() { return this.questForm?.controls; }
  get questions(): FormArray {
    return this.questForm.get("questions") as FormArray
  }

  newQuestion(): FormGroup {
    return this.fb.group({
      quiz_title: '',
      latitude: '',
      longitude: '',
      mythica: '',
      mission_id: '1'
    })

  }

  addQuestion() {
    this.questions.push(this.newQuestion());

  }

  removeQuestion(i: number) {
    this.questions.removeAt(i);
  }
  onSubmit() {
    this.submitted = true;
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    }
  }
  _sendSaveRequest(formData: any) {

    let questions = formData.questions;
    
    let checkFields = this.checkFields(questions);
    if (checkFields.fields > 0) {
      Swal.fire("Mission!", checkFields?.msg, "error");
      return;
    }
    delete formData.questions;
    this.sp.show();
    this.api.postData('mission/createMission', formData)
      .then((response: any) => {
        this.sp.hide();
        questions.forEach((element: any) => {
          element.mission_id = response?.data?._id;
        });
        this.api.postData('mission/createQuiz', questions)
          .then((responseQ: any) => {
            setTimeout(() => {
              this.helper.successToast("Mission Created Successfully");
            }, 1000);
            setTimeout(() => {
              this.router.navigate(['mission/list-mission']);
            }, 2000);
          });
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Mission!", "There is an error, please try again", "error");
      });
  }

  checkFields(dataArray: any[]): any {
    for (let i = 0; i < dataArray.length; i++) {
      const obj = dataArray[i];
      const emptyFields = [];
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] === "") {
            emptyFields.push(key); // Store the empty field name
          }
        }
      }
      if (emptyFields.length > 0) {
        let obj = {
          fields: emptyFields.length,
          msg: `For Quiz ${i + 1}, the following fields are empty: ${emptyFields.join(", ")}`
        }
        return obj;
      } else {
        let obj = {
          fields: 0,
          msg: `For Quiz ${i + 1}, the following fields are empty: ${emptyFields.join(", ")}`
        }
        return obj;
      }
    }
  }
}