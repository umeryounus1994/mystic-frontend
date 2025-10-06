import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-skygifts',
  templateUrl: './edit-skygifts.component.html',
  styleUrl: './edit-skygifts.component.scss'
})
export class EditSkygiftsComponent implements OnInit {
  skyGiftForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  reward: File | undefined = undefined;
  giftId = "";
  existingRewardFile = ""; 

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private router: Router, private fb: FormBuilder, private route: ActivatedRoute) {
      this.route.queryParams.subscribe(params => {
        if (params && Object.keys(params).length > 0) {
          this.giftId = params['giftId'];
        }
      });
  }

  ngOnInit() {
    this.skyGiftForm = this.fb.group({
      gift_name: ['', [Validators.required, Validators.minLength(3)]],
      gift_description: ['', [Validators.required, Validators.minLength(5)]],
      mythica_reward: ['', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required]
    });
    this.getAllCreatures();
    this.getSkyGiftDetails();
  }

  get f() { return this.skyGiftForm?.controls; }

  getSkyGiftDetails() {
    this.sp.show();
    this.api.get('skyGift/' + this.giftId)
      .then((response: any) => {
        this.sp.hide();
        const gift = response?.data;
        this.skyGiftForm.controls['gift_name'].setValue(gift?.gift_name);
        this.skyGiftForm.controls['gift_description'].setValue(gift?.gift_description);
        this.skyGiftForm.controls['mythica_reward'].setValue(gift?.mythica_reward?._id);
        this.skyGiftForm.controls['latitude'].setValue(gift?.location?.coordinates[1]);
        this.skyGiftForm.controls['longitude'].setValue(gift?.location?.coordinates[0]);
        this.existingRewardFile = gift?.reward_file;
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Error!", "Failed to load sky gift details", "error");
      });
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
      fD.append('reward_file', this.reward!, this.reward?.name);
    }

    this.sp.show();
    this.api.postImageData('skyGift/edit/' + this.giftId, fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Sky Gift Updated Successfully");
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
