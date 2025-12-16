import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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

  constructor(
    private api: RestApiService, 
    private sp: NgxSpinnerService, 
    private helper: HelperService,
    public router: Router, 
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
      this.route.queryParams.subscribe(params => {
        if (params && Object.keys(params).length > 0) {
          this.giftId = params['giftId'];
        }
      });
  }

  // Custom validators
  validateLatitude(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '') {
      return { required: true };
    }
    const latStr = String(control.value).trim();
    // Check for zero variations
    if (latStr === '0' || latStr === '0000' || latStr === '00000' || /^0+$/.test(latStr)) {
      return { invalidLatitude: true };
    }
    const lat = parseFloat(latStr);
    if (isNaN(lat) || lat < -90 || lat > 90 || lat === 0) {
      return { invalidLatitude: true };
    }
    return null;
  }

  validateLongitude(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '') {
      return { required: true };
    }
    const lngStr = String(control.value).trim();
    // Check for zero variations
    if (lngStr === '0' || lngStr === '0000' || lngStr === '00000' || /^0+$/.test(lngStr)) {
      return { invalidLongitude: true };
    }
    const lng = parseFloat(lngStr);
    if (isNaN(lng) || lng < -180 || lng > 180 || lng === 0) {
      return { invalidLongitude: true };
    }
    return null;
  }

  onLatitudeInput(event: any) {
    const value = String(event.target.value).trim();
    // Check for zero variations and clear them
    if (value === '0' || value === '0000' || value === '00000' || /^0+$/.test(value)) {
      event.target.value = '';
      this.skyGiftForm.patchValue({ latitude: '' });
      this.skyGiftForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.skyGiftForm.get('latitude')?.markAsTouched();
    }
  }

  onLongitudeInput(event: any) {
    const value = String(event.target.value).trim();
    // Check for zero variations and clear them
    if (value === '0' || value === '0000' || value === '00000' || /^0+$/.test(value)) {
      event.target.value = '';
      this.skyGiftForm.patchValue({ longitude: '' });
      this.skyGiftForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.skyGiftForm.get('longitude')?.markAsTouched();
    }
  }

  ngOnInit() {
    this.skyGiftForm = this.fb.group({
      gift_name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      gift_description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      mythica_reward: ['', Validators.required],
      latitude: ['', [Validators.required, this.validateLatitude.bind(this)]],
      longitude: ['', [Validators.required, this.validateLongitude.bind(this)]]
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
        Swal.fire(this.translate.instant('MESSAGES.ERROR'), this.translate.instant('MESSAGES.FAILED_TO_LOAD'), "error");
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
    
    // First, validate latitude and longitude for "0" and "0000" values BEFORE form validation
    const latStr = String(this.skyGiftForm.value.latitude || '').trim();
    const lngStr = String(this.skyGiftForm.value.longitude || '').trim();
    
    // Check for all zero variations (0, 0000, 00000, etc.)
    if (!latStr || latStr === '' || latStr === '0' || latStr === '0000' || latStr === '00000' || /^0+$/.test(latStr)) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_VALID_NOT_ZERO'), "error");
      this.skyGiftForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.skyGiftForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || lngStr === '0000' || lngStr === '00000' || /^0+$/.test(lngStr)) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_VALID_NOT_ZERO'), "error");
      this.skyGiftForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.skyGiftForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Validate latitude and longitude - parse and check
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    // Double check for zero after parsing
    if (isNaN(lat) || lat < -90 || lat > 90 || lat === 0 || Math.abs(lat) < 0.0001) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_REQUIRED_VALID'), "error");
      this.skyGiftForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.skyGiftForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180 || lng === 0 || Math.abs(lng) < 0.0001) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_REQUIRED_VALID'), "error");
      this.skyGiftForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.skyGiftForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Check form validity AFTER all custom validations
    if (!this.skyGiftForm?.valid) {
      const errors = [];
      if (this.f['gift_name']?.errors) errors.push(this.translate.instant('FORMS.GIFT_NAME'));
      if (this.f['gift_description']?.errors) errors.push(this.translate.instant('FORMS.GIFT_DESCRIPTION'));
      if (this.f['mythica_reward']?.errors) errors.push(this.translate.instant('FORMS.MYTHICA_REWARD'));
      if (this.f['latitude']?.errors) {
        if (this.f['latitude'].errors['invalidLatitude']) {
          Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_REQUIRED_VALID'), "error");
        } else {
          errors.push(this.translate.instant('FORMS.LATITUDE'));
        }
        return;
      }
      if (this.f['longitude']?.errors) {
        if (this.f['longitude'].errors['invalidLongitude']) {
          Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_REQUIRED_VALID'), "error");
        } else {
          errors.push(this.translate.instant('FORMS.LONGITUDE'));
        }
        return;
      }
      
      if (errors.length > 0) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('VALIDATION.PLEASE_FIX_ERRORS')}: ${errors.join(', ')}`, "error");
      }
      return; // Don't proceed if form is invalid
    }
    
    // All validations passed, submit the form
    this._sendSaveRequest(this.skyGiftForm.value);
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
            this.helper.successToast(this.translate.instant('MESSAGES.SKY_GIFT_UPDATED_SUCCESS'));
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['skygifts/list-skygifts']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire(this.translate.instant('SIDEBAR.SKY_GIFTS'), this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }

  onFileSelected(event: any, type: string) {
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }
}
