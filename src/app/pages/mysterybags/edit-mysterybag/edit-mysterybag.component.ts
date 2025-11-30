import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';

@Component({
  selector: 'app-edit-mysterybag',
  templateUrl: './edit-mysterybag.component.html',
  styleUrl: './edit-mysterybag.component.scss'
})
export class EditMysterybagComponent implements OnInit {
  mysteryBagForm!: FormGroup;
  submitted = false;
  rewardFile: File | null = null;
  bagId = ""; 
  existingRewardFile = '';

  constructor(
    private fb: FormBuilder,
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private helper: HelperService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && Object.keys(params).length > 0) {
        this.bagId = params['bagId'];
      }
    });
  }

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
    this.getMysteryBagDetails();
  }

  get f() { return this.mysteryBagForm?.controls; }

  getMysteryBagDetails() {
    this.sp.show();
    this.api.get('mysterybag/' + this.bagId)
      .then((response: any) => {
        this.sp.hide();
        const bag = response?.data;
        this.mysteryBagForm.controls['bag_title'].setValue(bag?.bag_title);
        this.mysteryBagForm.controls['bag_description'].setValue(bag?.bag_description);
        this.mysteryBagForm.controls['clue_text'].setValue(bag?.clue_text);
        this.mysteryBagForm.controls['reward_text'].setValue(bag?.reward_text);
        this.mysteryBagForm.controls['bag_type'].setValue(bag?.bag_type);
        this.mysteryBagForm.controls['latitude'].setValue(bag?.location?.coordinates[1]);
        this.mysteryBagForm.controls['longitude'].setValue(bag?.location?.coordinates[0]);
        this.mysteryBagForm.controls['visibility_radius'].setValue(bag?.visibility_radius);
        this.existingRewardFile = bag?.reward_file;
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Error!", "Failed to load mystery bag details", "error");
      });
  }

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
    fD.append('existingRewardFile', this.existingRewardFile);
    
    if(this.rewardFile) {
      fD.append('reward_file', this.rewardFile!, this.rewardFile?.name);
    }

    this.sp.show();
    this.api.postImageData('mysterybag/edit/' + this.bagId, fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Mystery Bag Updated Successfully");
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
