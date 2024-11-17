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
  selector: 'app-edit-hunt',
  templateUrl: './edit-hunt.component.html',
  styleUrl: './edit-hunt.component.scss'
})
export class EditHuntComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  option5: File | undefined = undefined;
  reward: File | undefined = undefined;
  Id = "";
  rewardFile="";
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
      this.route.queryParams.subscribe(params => {
        if (params && Object.keys(params).length > 0) {
          this.Id = params['Id'];
        }
      });
  }
  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
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
      premium_hunt: [false],
      hunt_package: [],
      treasure_hunt_start_date: ['', Validators.required],
      treasure_hunt_end_date: ['', Validators.required],
      questions: this.fb.array([]),
      qr_code: [''],
      have_qr: [false],
    });
    // this.addQuestion();
    // this.addQuestion();
    // this.addQuestion();
    // this.addQuestion();
    // this.addQuestion();
    this.getAllCreatures()
    this.getProductDetails()
  }
  getProductDetails() {
    
    this.api.get('hunt/get_hunt_by_id/' + this.Id)
      .then((response: any) => {
        this.sp.hide();
       this.questForm.controls['treasure_hunt_title'].setValue(response?.data?.treasure_hunt_title);
        this.questForm.controls['no_of_xp'].setValue(response?.data?.no_of_xp);
        this.questForm.controls['no_of_crypes'].setValue(response?.data?.no_of_crypes);
        this.questForm.controls['level_increase'].setValue(response?.data?.level_increase);
        this.questForm.controls['premium_hunt'].setValue(response?.data?.premium_hunt);
        this.questForm.controls['have_qr'].setValue(response?.data?.have_qr);
        this.questForm.controls['hunt_package'].setValue(response?.data?.hunt_package);
        this.questForm.controls['mythica_ID'].setValue(response?.data?.mythicaID);
        this.questForm.controls['hunt_latitude'].setValue(response?.data?.location?.coordinates[0]);
        this.questForm.controls['hunt_longitude'].setValue(response?.data?.location?.coordinates[1]);
        this.questForm.controls['treasure_hunt_start_date'].setValue(moment(response?.data?.mission_start_date).format("DD/mm/yyyy"));
        this.questForm.controls['treasure_hunt_end_date'].setValue(moment(response?.data?.mission_end_date).format("DD/mm/yyyy"));
        this.rewardFile = response?.data?.reward_file;
        this.QrCode = response?.data?.qr_code != "" ? response?.data?.qr_code : Math.floor(new Date().valueOf() * Math.random()).toString()+(new Date().getTime()).toString(36);
        let sorted = response?.data?.quiz.sort((a:any, b:any) => a.quiz_sort - b.quiz_sort);
        sorted.forEach((quiz:any) => {
          const questionGroup = this.newQuestion(quiz?.quiz_sort);
          questionGroup.patchValue({
            treasure_hunt_title: quiz.treasure_hunt_title,
            latitude: quiz.location.coordinates[0],
            longitude: quiz.location.coordinates[1],
            mythica: quiz.mythica._id,
            treasure_hunt_id: quiz.treasure_hunt_id,
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
     
  newQuestion(sort:any): FormGroup {  
    return this.fb.group({  
      treasure_hunt_title: '',  
      latitude: '',
      longitude: '',
      mythica: '',
      treasure_hunt_id: '1',
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
     
  addQuestion(sort:any) {  
    this.questions.push(this.newQuestion(sort));  
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
    const fD = new FormData();

    fD.append('treasure_hunt_title', formData?.treasure_hunt_title);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('hunt_latitude', formData?.hunt_latitude);
    fD.append('hunt_longitude', formData?.hunt_longitude);
    fD.append('premium_hunt', formData?.premium_hunt);
    fD.append('hunt_package', formData?.hunt_package);
    fD.append('treasure_hunt_start_date', formData?.treasure_hunt_start_date);
    fD.append('treasure_hunt_end_date', formData?.treasure_hunt_end_date);
    fD.append('have_qr', formData?.have_qr);
    if(formData?.have_qr === 'true'){
      fD.append('qr_code', this.QrCode);
    }
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
    if(this.option4){
      fD.append('option4', this.option4!, this.option4?.name);
    }
    if(this.option5){
      fD.append('option5', this.option5!, this.option5?.name);
    }
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }
    this.sp.show();
    this.api.postImageData('hunt/updateTreasureHuntAdmin/'+this.Id, fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Treasure Hunt Updated Successfully");
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
  if(type == 'option4'){
    this.option4 = event.target.files[0];
  }
  if(type == 'option5'){
    this.option5 = event.target.files[0];
  }
  if(type == 'reward'){
    this.reward = event.target.files[0];
  }
}
}
