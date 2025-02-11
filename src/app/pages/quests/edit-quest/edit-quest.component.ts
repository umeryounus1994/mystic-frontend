import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-quest',
  templateUrl: './edit-quest.component.html',
  styleUrl: './edit-quest.component.scss'
})
export class EditQuestComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  allCreatures: any = [];
  reward: File | undefined = undefined;
  Id = '';
  rewardFile = '';
  quest_file: File | undefined = undefined;
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  option5: File | undefined = undefined;
  questimg = '';
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
      quest_question: ['', [Validators.required, Validators.minLength(5)]],
      quest_title: ['', [Validators.required, Validators.minLength(5)]],
      no_of_xp: ['', Validators.required],
      no_of_crypes: ['', Validators.required],
      level_increase: ['', Validators.required],
      mythica_ID: ['', Validators.required],
      quest_type: ['', Validators.required],
      questions: this.fb.array([])
    });
   
    this.getAllCreatures()
    this.getProductDetails()
  }
  getProductDetails() {
    
    this.api.get('quest/get_quest_by_id/' + this.Id)
      .then((response: any) => {
        this.sp.hide();
        if(response?.data?.questQuiz && response?.data?.questQuiz.length < 1){
          this.addQuestion();
        }
       this.questForm.controls['quest_question'].setValue(response?.data?.quest?.quest_question);
        this.questForm.controls['quest_title'].setValue(response?.data?.quest?.quest_title);
        this.questForm.controls['no_of_xp'].setValue(response?.data?.quest?.no_of_xp);
        this.questForm.controls['level_increase'].setValue(response?.data?.quest?.level_increase);
        this.questForm.controls['no_of_crypes'].setValue(response?.data?.quest?.no_of_crypes);
        this.questForm.controls['mythica_ID'].setValue(response?.data?.quest?.mythica_ID?._id);
        this.questForm.controls['quest_type'].setValue(response?.data?.quest?.quest_type || "simple");
        this.rewardFile = response?.data?.quest?.reward_file
        this.questimg = response?.data?.quest?.quest_image
        response?.data?.questQuiz?.forEach((question: any) => {
          this.questions().push(this.fb.group({
            answer: question.answer,
            correct_option: question.correct_option,
          }));
        });


      })};
  get f() { return this.questForm?.controls; }
  questions() : FormArray {  
    return this.questForm.get("questions") as FormArray  
  }  
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
     
  newQuestion(): FormGroup {  
    return this.fb.group({  
      answer: '',  
      correct_option: false,  
      quest_id: ''
    })  
  }     
  addQuestion() {  
    this.questions().push(this.newQuestion());  
  }  
  removeQuestion(i:number) {  
    this.questions().removeAt(i);  
  } 
  onSubmit(){
    this.submitted = true;
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    }
  }
  _sendSaveRequest(formData: any) {
    this.sp.show();
    let questions = formData.questions;
    const fD = new FormData();
    fD.append('quest_question', formData?.quest_question);
    fD.append('quest_title', formData?.quest_title);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('quest_type', formData?.quest_type);
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }
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
    if(this.quest_file){
      fD.append('quest_file', this.quest_file!, this.quest_file?.name);
    }
    fD.append('questions', JSON.stringify(formData.questions));
    this.api.postImageData('quest/updateQuest/'+this.Id, fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Quest Updated Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['quest/list-quest']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Quest!", "There is an error, please try again", "error");
      });
  }
  onFileSelected(event: any, type: string) {
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }
  onFileSelectedQuest(event: any) {
    this.quest_file = event.target.files[0];
}
onFileSelectedOptions(event: any, type: string) {
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
}
}