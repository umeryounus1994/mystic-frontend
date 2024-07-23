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
    this.questions().removeAt(i);  
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

    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }
    delete formData.questions;
    this.sp.show();
    this.api.postImageData('drop/createDrop', fD)
      .then((response: any) => {
          this.sp.hide();
          questions.forEach((element: any) => {
            element.drop_id = response?.data?._id;
          });
          this.api.postData('drop/createDropQuiz', questions)
          .then((responseQ: any) => {
              setTimeout(() => {
                this.helper.successToast("Drop Created Successfully");
              }, 1000);
              setTimeout(() => {
                this.router.navigate(['drop/list-drop']);
              }, 2000);
          });
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
}
