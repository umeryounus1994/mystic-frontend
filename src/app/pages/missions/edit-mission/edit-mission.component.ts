import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import moment from 'moment';

@Component({
  selector: 'app-edit-mission',
  templateUrl: './edit-mission.component.html',
  styleUrl: './edit-mission.component.scss'
})
export class EditMissionComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  reward: File | undefined = undefined;
  Id="";
  rewardFile ='';

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
      this.route.queryParams.subscribe(params => {
        if (params && Object.keys(params).length > 0) {
          this.Id = params['Id'];
        }
      });
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
    // this.addQuestion();
    // this.addQuestion();
    // this.addQuestion();
    this.getAllCreatures()
    this.getProductDetails();
  }
  getProductDetails() {
    
    this.api.get('mission/get_mission_by_id/' + this.Id)
      .then((response: any) => {
        this.sp.hide();
       this.questForm.controls['mission_title'].setValue(response?.data?.mission_title);
        this.questForm.controls['no_of_xp'].setValue(response?.data?.no_of_xp);
        this.questForm.controls['no_of_crypes'].setValue(response?.data?.no_of_crypes);
        this.questForm.controls['level_increase'].setValue(response?.data?.level_increase);
        this.questForm.controls['mythica_ID'].setValue(response?.data?.mythicaID);
        this.questForm.controls['mission_latitude'].setValue(response?.data?.location?.coordinates[0]);
        this.questForm.controls['mission_longitude'].setValue(response?.data?.location?.coordinates[1]);
        this.questForm.controls['mission_start_date'].setValue(moment(response?.data?.mission_start_date).format("dd/mm/yyyy"));
        this.questForm.controls['mission_end_date'].setValue(moment(response?.data?.mission_end_date).format("dd/mm/yyyy"));
        this.rewardFile = response?.data?.reward_file;
        let sorted = response?.data?.quiz.sort((a:any, b:any) => a.quiz_sort - b.quiz_sort);
        sorted.forEach((quiz:any) => {
          const questionGroup = this.newQuestion(quiz?.quiz_sort);
          questionGroup.patchValue({
            quiz_title: quiz.quiz_title,
            latitude: quiz.location.coordinates[0],
            longitude: quiz.location.coordinates[1],
            mythica: quiz.mythica._id,
            mission_id: quiz.mission_id,
            quiz_file: quiz.quiz_file
          });
  
          const options = questionGroup.get('options') as FormArray;
          options.clear();
          quiz.options.forEach((option:any) => {
            options.push(this.fb.group({
              option: [option.answer, Validators.required],
              correct: [option.correct_option, Validators.required]
            }));
          });
  
          this.questions.push(questionGroup);
        });
      })};
  getAllCreatures() {
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

  newQuestion(sort: any): FormGroup {
    return this.fb.group({
      quiz_title: '',
      latitude: '',
      longitude: '',
      mythica: '',
      mission_id: '1',
      quiz_file: 'a',
      sort,
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

  addQuestion(sort: any) {
    this.questions.push(this.newQuestion(sort));

  }

  removeQuestion(i: number) {
    this.questions.removeAt(i);
  }
  onSubmit() {
    this.submitted = true;
    const result = this.findEmptyFields(this.questForm?.value?.questions);
    if(result.length > 0){
      if(result[0]?.emptyFields.length > 0 || result[1]?.emptyFields.length > 0 || result[2]?.emptyFields.length > 0) {
        let message = result.map((question:any) => 
        `Question ${question.questionNumber} is missing: ${question.emptyFields.join(', ')}.`).join('\n');
        Swal.fire("Mission!", message, "error");
        return;
      }
    }
    
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    }
  }
  _sendSaveRequest(formData: any) {
    const fD = new FormData();
    fD.append('mission_title', formData?.mission_title);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('mission_latitude', formData?.mission_latitude);
    fD.append('mission_longitude', formData?.mission_longitude);
    fD.append('mission_start_date', formData?.mission_start_date);
    fD.append('mission_end_date', formData?.mission_end_date);
    fD.append('rewardFile', this.rewardFile);
    fD.append('questions', JSON.stringify(formData?.questions));
    if(this.option1){
      fD.append('option1', this.option1!, this.option1?.name);
    }
    if(this.option2){
      fD.append('option2', this.option2!, this.option2?.name);
    }
    if(this.option3){
      fD.append('option3', this.option3!, this.option3?.name);
    }
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }

    this.sp.show();
    this.api.postImageData('mission/updateMissionAdmin/'+this.Id, fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Mission Updated Successfully");
        }, 1000);
        setTimeout(() => {
          this.router.navigate(['mission/list-mission']);
        }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Mission!", "There is an error, please try again", "error");
      });
  }
  onFileSelected(event: any, type: string) {
    if(type == 'option1'){
      this.option1 = event.target.files[0];
    }
    if(type == 'option2'){
      this.option2 = event.target.files[0];
    }
    if(type == 'option3'){
      this.option3 = event.target.files[0];
    }
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }

  findEmptyFields(quizData:any) {
    let emptyFieldsQuestions:any = [];

    quizData.forEach((question:any, index:any) => {
        let emptyFields = [];

        if (question.quiz_title === '') {
            emptyFields.push('quiz_title');
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
