import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-quest',
  templateUrl: './create-quest.component.html',
  styleUrl: './create-quest.component.scss'
})
export class CreateQuestComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  allCreatures: any = [];

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
      this.QrCode = Math.floor(new Date().valueOf() * Math.random()).toString()+(new Date().getTime()).toString(36);
  }
  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }
  ngOnInit() {
    this.questForm = this.fb.group({
      quest_question: ['', [Validators.required, Validators.minLength(5)]],
      quest_title: ['', [Validators.required, Validators.minLength(5)]],
      no_of_xp: ['', Validators.required],
      no_of_crypes: ['', Validators.required],
      level_increase: ['', Validators.required],
      mythica_ID: ['', Validators.required],
      qr_code: [this.QrCode],
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
    delete formData.questions;
    this.api.postData('quest/createQuest', formData)
      .then((response: any) => {
          this.sp.hide();
          questions.forEach((element: any) => {
            element.quest_id = response?.data?._id;
          });
          this.api.postData('quest/createQuestQuiz', questions)
          .then((responseQ: any) => {
              setTimeout(() => {
                this.helper.successToast("Quest Created Successfully");
              }, 1000);
              setTimeout(() => {
                this.router.navigate(['quest/list-quest']);
              }, 2000);
          });
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Quest!", "There is an error, please try again", "error");
      });
  }
}
