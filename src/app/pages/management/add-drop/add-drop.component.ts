import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
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
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  option5: File | undefined = undefined;
  option6: File | undefined = undefined;

  constructor(
    private api: RestApiService, 
    private sp: NgxSpinnerService, 
    private helper: HelperService,
    public router: Router, 
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
  }
  onChangeURL(url: SafeUrl) {
  }
  ngOnInit() {
    this.questForm = this.fb.group({
      drop_name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      drop_description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      mythica_reward: ['', Validators.required],
      latitude: ['', [Validators.required, this.validateLatitude.bind(this)]],
      longitude: ['', [Validators.required, this.validateLongitude.bind(this)]],
      no_of_xp: [1, [Validators.required, Validators.min(1)]],
      mythica_ID: ['', Validators.required],
      drop_type: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.addQuestion();
    this.getAllCreatures()
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

  preventNegativeInput(event: KeyboardEvent) {
    const invalidKeys = ['-', '+', 'e', 'E'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validateNumberInput(event: any, fieldName: string, minValue: number = 0) {
    const input = event.target;
    let value = input.value;
    
    if (value.includes('-')) {
      value = value.replace(/-/g, '');
    }
    
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || value === '' || numValue < minValue) {
      input.value = minValue;
      this.questForm.patchValue({ [fieldName]: minValue });
    } else {
      const wholeNumber = Math.floor(numValue);
      input.value = wholeNumber;
      this.questForm.patchValue({ [fieldName]: wholeNumber });
    }
  }

  onLatitudeInput(event: any) {
    const value = String(event.target.value).trim();
    // Check for zero variations and clear them
    if (value === '0' || value === '0000' || value === '00000' || /^0+$/.test(value)) {
      event.target.value = '';
      this.questForm.patchValue({ latitude: '' });
      this.questForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.questForm.get('latitude')?.markAsTouched();
    }
  }

  onLongitudeInput(event: any) {
    const value = String(event.target.value).trim();
    // Check for zero variations and clear them
    if (value === '0' || value === '0000' || value === '00000' || /^0+$/.test(value)) {
      event.target.value = '';
      this.questForm.patchValue({ longitude: '' });
      this.questForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.questForm.get('longitude')?.markAsTouched();
    }
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
    const latStr = String(this.questForm.value.latitude || '').trim();
    const lngStr = String(this.questForm.value.longitude || '').trim();
    
    // Check for all zero variations (0, 0000, 00000, etc.)
    if (!latStr || latStr === '' || latStr === '0' || latStr === '0000' || latStr === '00000' || /^0+$/.test(latStr)) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_VALID_NOT_ZERO'), "error");
      this.questForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.questForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || lngStr === '0000' || lngStr === '00000' || /^0+$/.test(lngStr)) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_VALID_NOT_ZERO'), "error");
      this.questForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.questForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Additional validation
    const formValue = this.questForm.value;
    if (formValue.no_of_xp <= 0 || isNaN(formValue.no_of_xp)) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.XP_MUST_BE_GREATER_THAN_ZERO'), "error");
      this.questForm.patchValue({ no_of_xp: 1 });
      return;
    }
    
    // Validate latitude and longitude - parse and check
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    // Double check for zero after parsing
    if (isNaN(lat) || lat < -90 || lat > 90 || lat === 0 || Math.abs(lat) < 0.0001) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_REQUIRED_VALID'), "error");
      this.questForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.questForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180 || lng === 0 || Math.abs(lng) < 0.0001) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_REQUIRED_VALID'), "error");
      this.questForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.questForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Check form validity AFTER all custom validations
    if (!this.questForm?.valid) {
      const errors = [];
      if (this.f['drop_name']?.errors) errors.push(this.translate.instant('FORMS.DROP_NAME'));
      if (this.f['drop_description']?.errors) errors.push(this.translate.instant('COMMON.DESCRIPTION'));
      if (this.f['no_of_xp']?.errors) errors.push(this.translate.instant('FORMS.NO_OF_XP'));
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
      if (this.f['mythica_reward']?.errors) errors.push(this.translate.instant('DROPS.MYTHICA_REWARD'));
      if (this.f['mythica_ID']?.errors) errors.push(this.translate.instant('FORMS.MYTHICA'));
      if (this.f['drop_type']?.errors) errors.push(this.translate.instant('FORMS.DROP_TYPE'));
      
      if (errors.length > 0) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('VALIDATION.PLEASE_FIX_ERRORS')}: ${errors.join(', ')}`, "error");
      }
      return; // Don't proceed if form is invalid
    }
    
    // All validations passed, submit the form
    this._sendSaveRequest(this.questForm.value);
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
    fD.append('drop_type', formData.drop_type);

    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
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
    if(this.option5){
      fD.append('option5', this.option5!, this.option5?.name);
    }
    if(this.option6){
      fD.append('option6', this.option6!, this.option6?.name);
    }
    fD.append('questions', JSON.stringify(formData.questions));
    this.sp.show();
    this.api.postImageData('drop/createDrop', fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast(this.translate.instant('MESSAGES.DROP_CREATED_SUCCESSFULLY'));
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['management/list-drop']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire(this.translate.instant('SIDEBAR.DROPS'), this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }
  onFileSelected(event: any, type: string) {
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }
  onFileSelectedOptions(event: any, type: string) {
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
    if(type == 'option5'){
      this.option5 = event.target.files[0];
    } 
    if(type == 'option6'){
      this.option6 = event.target.files[0];
    } 
  }
}
