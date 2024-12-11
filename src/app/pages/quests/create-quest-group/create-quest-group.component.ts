import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-quest-group',
  templateUrl: './create-quest-group.component.html',
  styleUrl: './create-quest-group.component.scss'
})
export class CreateQuestGroupComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  allCreatures: any = [];
  reward: File | undefined = undefined;

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
      this.QrCode = Math.floor(new Date().valueOf() * Math.random()).toString()+(new Date().getTime()).toString(36);
  }
  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }
  ngOnInit() {
    this.questForm = this.fb.group({
      quest_group_name: ['', [Validators.required, Validators.minLength(5)]],
      no_of_crypes: ['', Validators.required],
      group_package: ['', Validators.required],
      qr_code: [this.QrCode]
    });
  }
  get f() { return this.questForm?.controls; }
     
  newQuestion(): FormGroup {  
    return this.fb.group({  
      answer: '',  
      correct_option: false,  
      quest_id: ''
    })  
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
    fD.append('quest_group_name', formData?.quest_group_name);
    fD.append('group_package', formData?.group_package);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('qr_code', formData?.qr_code);
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }
    delete formData.questions;
    this.api.postImageData('quest/createQuestGroup', fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Quest Group Created Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['quest/list-quest-group']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Quest Group!", "There is an error, please try again", "error");
      });
  }
  onFileSelected(event: any, type: string) {
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }
}
