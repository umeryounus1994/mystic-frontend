import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-hunt',
  templateUrl: './create-hunt.component.html',
  styleUrl: './create-hunt.component.scss'
})
export class CreateHuntComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.questForm = this.fb.group({
      treasure_hunt_title: ['', [Validators.required, Validators.minLength(5)]],
      no_of_xp: ['', Validators.required],
      no_of_crypes: ['', Validators.required],
      level_increase: ['', Validators.required],
      mythica_ID: ['', Validators.required],
      hunt_latitude: ['', Validators.required],
      hunt_longitude: ['', Validators.required],
      premium_hunt: [false, Validators.required],
      hunt_price: [0],
      treasure_hunt_start_date: ['', Validators.required],
      treasure_hunt_end_date: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.addQuestion();
    this.addQuestion();
    this.addQuestion();
    this.addQuestion();
    this.addQuestion();
    this.getAllCreatures()
  }
  get f() { return this.questForm?.controls; }
  get questions() : FormArray {  
    return this.questForm.get("questions") as FormArray  
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
     
  newQuestion(): FormGroup {  
    return this.fb.group({  
      treasure_hunt_title: '',  
      latitude: '',
      longitude: '',
      mythica: '',
      treasure_hunt_id: '1',
      options: this.fb.array([this.createOption(), this.createOption(), this.createOption(), this.createOption()])
    })  
   
  }  
  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }
  createOption(): FormGroup {
    return this.fb.group({
      option: ['', Validators.required],
      correct: [false, Validators.required]
    });
  }
     
  addQuestion() {  
    this.questions.push(this.newQuestion());  

  }  
     
  removeQuestion(i:number) {  
    this.questions.removeAt(i);  
  } 
  onSubmit(){
    this.submitted = true;
    const result = this.findEmptyFields(this.questForm?.value?.questions);
    if(result.length > 0){
      if(result[0]?.emptyFields.length > 0 || result[1]?.emptyFields.length > 0 || result[2]?.emptyFields.length > 0) {
        let message = result.map((question:any) => 
        `Question ${question.questionNumber} is missing: ${question.emptyFields.join(', ')}.`).join('\n');
        Swal.fire("Treasure HUNT!", message, "error");
        return;
      }
    }
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    }
  }
  _sendSaveRequest(formData: any) {
    this.sp.show();
    this.api.postData('hunt/createTreasureHuntAdmin', formData)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Treasure Hunt Created Successfully");
        }, 1000);
        setTimeout(() => {
          this.router.navigate(['hunt/list-hunt']);
        }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Treasure Hunt!", "There is an error, please try again", "error");
      });
  }
  findEmptyFields(quizData:any) {
    let emptyFieldsQuestions:any = [];

    quizData.forEach((question:any, index:any) => {
        let emptyFields = [];

        if (question.treasure_hunt_title === '') {
            emptyFields.push('treasure_hunt_title');
        }
        if (question.latitude === '') {
          emptyFields.push('latitude');
        }
         if (question.longitude === '') {
          emptyFields.push('longitude');
        }
        if (question.mythica === '') {
            emptyFields.push('mythica');
        }

        question.options.forEach((option:any, optIndex:any) => {
            if (option.option === '') {
                emptyFields.push(`option ${optIndex + 1}`);
            }
        });

        if (emptyFields.length > 0) {
            emptyFieldsQuestions.push({
                questionNumber: index + 1,
                emptyFields: emptyFields
            });
        }
    });

    return emptyFieldsQuestions;
}
}