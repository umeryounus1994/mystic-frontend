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
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
      this.QrCode = Math.floor(new Date().valueOf() * Math.random()).toString()+(new Date().getTime()).toString(36);
  }

  ngOnInit() {
    this.questForm = this.fb.group({
      treasure_hunt_title: ['', [Validators.required, Validators.minLength(5)]],
      no_of_xp: ['', Validators.required],
      no_of_crypes: ['', Validators.required],
      level_increase: ['', Validators.required],
      mythica: ['', Validators.required],
      mythica_ar_model: ['', Validators.required],
      treasure_hunt_start_date: ['', Validators.required],
      treasure_hunt_end_date: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.addQuestion();
  }
  get f() { return this.questForm?.controls; }
  get questions() : FormArray {  
    return this.questForm.get("questions") as FormArray  
  }  
     
  newQuestion(): FormGroup {  
    return this.fb.group({  
      treasure_hunt_title: '',  
      creature: '',
      latitude: '',
      longitude: '',
      mythica: '',
      treasure_hunt_id: ''
    })  
   
  }  
     
  addQuestion() {  
    this.questions.push(this.newQuestion());  

  }  
     
  removeQuestion(i:number) {  
    this.questions.removeAt(i);  
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
    this.api.postData('hunt/createTreasureHunt', formData)
      .then((response: any) => {
          this.sp.hide();
          questions.forEach((element: any) => {
            element.treasure_hunt_id = response?.data?._id;
          });
          this.api.postData('hunt/createHuntQuiz', questions)
          .then((responseQ: any) => {
              setTimeout(() => {
                this.helper.successToast("Treasure Hunt Created Successfully");
              }, 1000);
              setTimeout(() => {
                this.router.navigate(['hunt/list-hunt']);
              }, 2000);
          });
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Treasure Hunt!", "There is an error, please try again", "error");
      });
  }
}