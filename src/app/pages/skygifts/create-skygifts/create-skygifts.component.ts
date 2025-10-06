import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-create-skygifts',
  templateUrl: './create-skygifts.component.html',
  styleUrl: './create-skygifts.component.scss'
})
export class CreateSkygiftsComponent implements OnInit {
  skyGiftForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  reward: File | undefined = undefined;

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.skyGiftForm = this.fb.group({
      gift_name: ['', [Validators.required, Validators.minLength(3)]],
      gift_description: ['', [Validators.required, Validators.minLength(5)]],
      mythica_reward: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
    });
    this.getAllCreatures();
  }

  get f() { return this.skyGiftForm?.controls; }

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
    if (this.skyGiftForm?.valid) {
      this._sendSaveRequest(this.skyGiftForm.value);
    }
  }

  _sendSaveRequest(formData: any) {
    const fD = new FormData();
    fD.append('gift_name', formData?.gift_name);
    fD.append('gift_description', formData?.gift_description);
    fD.append('mythica_reward', formData?.mythica_reward);
    fD.append('latitude', formData?.latitude);
    fD.append('longitude', formData?.longitude);

    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }

    this.sp.show();
    this.api.postImageData('skygift/create', fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Sky Gift Created Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['skygifts/list-skygifts']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Sky Gift!", "There is an error, please try again", "error");
      });
  }

  onFileSelected(event: any, type: string) {
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }
}
