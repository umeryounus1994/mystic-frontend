import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-mysteries',
  templateUrl: './add-mysteries.component.html',
  styleUrl: './add-mysteries.component.scss'
})
export class AddMysteriesComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  questionPicture: File | undefined = undefined;
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
  }
  ngOnInit() {
    this.questForm = this.fb.group({
      picture_mystery_question: ['', [Validators.required, Validators.minLength(5)]],
      picture_mystery_question_url: [''],
      no_of_xp: ['', Validators.required],
      no_of_crypes: ['', Validators.required],
      level_increase: ['', Validators.required],
      mythica_ID: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.addQuestion();
    this.getAllCreatures()
  }
  get f() { return this.questForm?.controls; }
  questions() : FormArray {  
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
      answer: null,  
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
    const fD = new FormData();
    fD.append('picture_mystery_question', formData?.picture_mystery_question);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    if(this.questionPicture){
      fD.append('picture_mystery_question_url', this.questionPicture!, this.questionPicture?.name);
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
    this.api.postImageData('pictureMystery/createPictureMystery', fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Picture Mystery Created Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['mystery/list-mystery']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Picture Mystery!", "There is an error, please try again", "error");
      });
  }
  onFileSelected(event: any, type: string) {
    console.log(type, event.target.files)
    if(type == 'questionPicture'){
      this.questionPicture = event.target.files[0];
    }
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
  }
}