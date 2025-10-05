import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';

@Component({
  selector: 'app-create-mysterybag',
  templateUrl: './create-mysterybag.component.html',
  styleUrl: './create-mysterybag.component.scss'
})
export class CreateMysterybagComponent implements OnInit { 
  mysteryBagForm!: FormGroup;
  submitted = false;
  rewardFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private helper: HelperService,
    private router: Router
  ) {}

  ngOnInit() {
    this.mysteryBagForm = this.fb.group({
      bag_title: ['', [Validators.required, Validators.minLength(3)]],
      bag_description: [''],
      clue_text: [''],
      reward_text: [''],
      bag_type: ['collectible', Validators.required],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      visibility_radius: [70, [Validators.required, Validators.min(1)]]
    });
  }

  get f() { return this.mysteryBagForm?.controls; }

  onRewardFileSelected(event: any) {
    this.rewardFile = event.target.files[0];
  }

  onSubmit() {
    this.submitted = true;
    if (this.mysteryBagForm?.valid) {
      this._sendSaveRequest(this.mysteryBagForm.value);
    }
  }

  _sendSaveRequest(formData: any) {
    const fD = new FormData();
    fD.append('bag_title', formData?.bag_title);
    fD.append('bag_description', formData?.bag_description || '');
    fD.append('clue_text', formData?.clue_text || '');
    fD.append('reward_text', formData?.reward_text || '');
    fD.append('bag_type', formData?.bag_type);
    fD.append('latitude', formData?.latitude);
    fD.append('longitude', formData?.longitude);
    fD.append('visibility_radius', formData?.visibility_radius);
    
    if(this.rewardFile) {
      fD.append('reward_file', this.rewardFile!, this.rewardFile?.name);
    }

    this.sp.show();
    this.api.postImageData('mysteryBag/create', fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Mystery Bag Created Successfully");
        }, 1000);
        setTimeout(() => {
          this.router.navigate(['mysterybag/list-mysterybag']);
        }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Mystery Bag!", "There is an error, please try again", "error");
      });
  }
}
