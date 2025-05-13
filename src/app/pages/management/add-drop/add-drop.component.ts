import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-drop',
  templateUrl: './add-drop.component.html',
  styleUrl: './add-drop.component.scss'
})
export class AddDropComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  reward: File | undefined = undefined;
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  option5: File | undefined = undefined;
  option6: File | undefined = undefined;

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {

  }
  onChangeURL(url: SafeUrl) {
  }
  ngOnInit() {
    this.questForm = this.fb.group({
      drop_name: ['', [Validators.required, Validators.minLength(5)]],
      drop_description: ['', [Validators.required, Validators.minLength(5)]],
      mythica_reward: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      no_of_xp: ['', Validators.required],
      mythica_ID: ['', Validators.required],
      drop_type: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.addQuestion();
    this.getAllCreatures()
  }
  get f() { return this.questForm?.controls; } 
  questions() : FormArray {  
    return this.questForm.get("questions") as FormArray  
  }  
  newQuestion(): FormGroup {  
    return this.fb.group({  
      answer: '',  
      correct_option: false,  
      drop_id: ''
    })  
  }     
  addQuestion() {  
    this.questions().push(this.newQuestion());  
  }  
  removeQuestion(i:number) {  
   // if(i > 0){
      this.questions().removeAt(i);  
   // }

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
  onSubmit(){
    this.submitted = true;
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    }
  }
  _sendSaveRequest(formData: any) {
    const fD = new FormData();
    let questions = formData.questions;

    fD.append('drop_name', formData?.drop_name);
    fD.append('drop_description', formData?.drop_description);
    fD.append('mythica_reward', formData?.mythica_reward);
    fD.append('latitude', formData?.latitude);
    fD.append('longitude', formData?.longitude);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('drop_type', formData.drop_type);

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
    if(this.option6){
      fD.append('option6', this.option6!, this.option6?.name);
    }
    fD.append('questions', JSON.stringify(formData.questions));
    //delete formData.questions;
    this.sp.show();
    this.api.postImageData('drop/createDrop', fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Drop Created Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['management/list-drop']);
          }, 2000);
          // if(questions.length > 0 && questions[0]?.answer != ''){
          //   questions.forEach((element: any) => {
          //     element.drop_id = response?.data?._id;
          //   });
          //   this.api.postData('drop/createDropQuiz', questions)
          //   .then((responseQ: any) => {
          //       setTimeout(() => {
          //         this.helper.successToast("Drop Created Successfully");
          //       }, 1000);
          //       setTimeout(() => {
          //         this.router.navigate(['management/list-drop']);
          //       }, 2000);
          //   });
          // } else {
          //   setTimeout(() => {
          //     this.helper.successToast("Drop Created Successfully");
          //   }, 1000);
          //   setTimeout(() => {
          //     this.router.navigate(['management/list-drop']);
          //   }, 2000);
          // }
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Drop!", "There is an error, please try again", "error");
      });
  }
  onFileSelected(event: any, type: string) {
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
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
    if(type == 'option6'){
      this.option6 = event.target.files[0];
    } 
  }
}
