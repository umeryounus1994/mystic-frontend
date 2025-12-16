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
  selector: 'app-add-mysteries',
  templateUrl: './add-mysteries.component.html',
  styleUrl: './add-mysteries.component.scss'
})
export class AddMysteriesComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  questionPicture: File | undefined = undefined;
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  correctOption = '';
  
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

  // Custom validators
  validateLatitude(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '' || control.value === null || control.value === undefined) {
      return { required: true };
    }
    
    // Convert to string first to catch "0000", "0", etc.
    const valueStr = String(control.value).trim();
    if (valueStr === '' || valueStr === '0' || valueStr === '0000') {
      return { invalidLatitude: true };
    }
    
    const lat = parseFloat(control.value);
    // Reject NaN, out of range, or exactly zero
    if (isNaN(lat) || lat < -90 || lat > 90 || lat === 0) {
      return { invalidLatitude: true };
    }
    return null;
  }

  validateLongitude(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '' || control.value === null || control.value === undefined) {
      return { required: true };
    }
    
    // Convert to string first to catch "0000", "0", etc.
    const valueStr = String(control.value).trim();
    if (valueStr === '' || valueStr === '0' || valueStr === '0000') {
      return { invalidLongitude: true };
    }
    
    const lng = parseFloat(control.value);
    // Reject NaN, out of range, or exactly zero
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
    const value = event.target.value;
    const numValue = parseFloat(value);
    
    // If the value is 0, "0", "0000", or any variation, clear it and set error
    if (value === '0' || value === '0000' || value === '00' || numValue === 0 || (value && Math.abs(numValue) < 0.0001)) {
      event.target.value = '';
      this.questForm.get('latitude')?.setValue('');
      this.questForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.questForm.get('latitude')?.markAsTouched();
      // Force form to be invalid
      this.questForm.setErrors({ ...this.questForm.errors, invalidLatitude: true });
    } else if (value && !isNaN(numValue)) {
      // Clear errors if valid
      if (numValue >= -90 && numValue <= 90 && numValue !== 0) {
        const currentErrors = this.questForm.get('latitude')?.errors;
        if (currentErrors && currentErrors['invalidLatitude']) {
          delete currentErrors['invalidLatitude'];
          if (Object.keys(currentErrors).length === 0) {
            this.questForm.get('latitude')?.setErrors(null);
          } else {
            this.questForm.get('latitude')?.setErrors(currentErrors);
          }
        }
      }
    }
  }

  onLongitudeInput(event: any) {
    const value = event.target.value;
    const numValue = parseFloat(value);
    
    // If the value is 0, "0", "0000", or any variation, clear it and set error
    if (value === '0' || value === '0000' || value === '00' || numValue === 0 || (value && Math.abs(numValue) < 0.0001)) {
      event.target.value = '';
      this.questForm.get('longitude')?.setValue('');
      this.questForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.questForm.get('longitude')?.markAsTouched();
      // Force form to be invalid
      this.questForm.setErrors({ ...this.questForm.errors, invalidLongitude: true });
    } else if (value && !isNaN(numValue)) {
      // Clear errors if valid
      if (numValue >= -180 && numValue <= 180 && numValue !== 0) {
        const currentErrors = this.questForm.get('longitude')?.errors;
        if (currentErrors && currentErrors['invalidLongitude']) {
          delete currentErrors['invalidLongitude'];
          if (Object.keys(currentErrors).length === 0) {
            this.questForm.get('longitude')?.setErrors(null);
          } else {
            this.questForm.get('longitude')?.setErrors(currentErrors);
          }
        }
      }
    }
  }

  ngOnInit() {
    this.questForm = this.fb.group({
      picture_mystery_question: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      picture_mystery_question_url: [''],
      no_of_xp: [1, [Validators.required, Validators.min(1)]],
      no_of_crypes: [0, [Validators.required, Validators.min(0)]],
      level_increase: [0, [Validators.required, Validators.min(0)]],
      mythica_ID: ['', Validators.required],
      questions: this.fb.array([]),
      latitude: ['', [Validators.required, this.validateLatitude]],
      longitude: ['', [Validators.required, this.validateLongitude]],
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
      answer: [null, Validators.required],  
      correct_option: [false],  
      quest_id: ''
    })  
  }  
     
  addQuestion() {  
    this.questions().push(this.newQuestion());  
  }  
     
  removeQuestion(i:number) {  
    // Ensure at least one answer always remains
    if (this.questions().length > 1) {
      this.questions().removeAt(i);
    } else {
      Swal.fire(this.translate.instant('MESSAGES.WARNING'), this.translate.instant('VALIDATION.AT_LEAST_ONE_ANSWER'), "warning");
    }
  } 

  onSubmit(){
    this.submitted = true;
    
    // Additional validation for numeric fields FIRST (before form validation check)
    const formValue = this.questForm.value;
    
    // Validate latitude and longitude FIRST - check for empty, zero, or invalid values
    // Get the actual input element value to catch "0000" before it's converted
    const latInput = document.querySelector('[formControlName="latitude"]') as HTMLInputElement;
    const lngInput = document.querySelector('[formControlName="longitude"]') as HTMLInputElement;
    
    const latControl = this.questForm.get('latitude');
    const lngControl = this.questForm.get('longitude');
    
    // Get raw input value first (before conversion)
    const latRawValue = latInput?.value || latControl?.value || '';
    const lngRawValue = lngInput?.value || lngControl?.value || '';
    
    // Convert to string to check original input
    const latStr = String(latRawValue).trim();
    const lngStr = String(lngRawValue).trim();
    
    // Check if empty or zero (including "0", "0000", etc.) - do this BEFORE form validation
    const latNum = parseFloat(latStr);
    const lngNum = parseFloat(lngStr);
    
    // More comprehensive check for zero values
    if (!latStr || latStr === '' || latStr === '0' || latStr === '0000' || latNum === 0 || isNaN(latNum) || Math.abs(latNum) < 0.0001) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_REQUIRED_VALID'), "error");
      latControl?.setErrors({ invalidLatitude: true });
      latControl?.markAsTouched();
      // Force form to be invalid
      this.questForm.setErrors({ ...this.questForm.errors, invalidLatitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || lngStr === '0000' || lngNum === 0 || isNaN(lngNum) || Math.abs(lngNum) < 0.0001) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_REQUIRED_VALID'), "error");
      lngControl?.setErrors({ invalidLongitude: true });
      lngControl?.markAsTouched();
      // Force form to be invalid
      this.questForm.setErrors({ ...this.questForm.errors, invalidLongitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    if (latNum < -90 || latNum > 90) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.INVALID_LATITUDE'), "error");
      latControl?.setErrors({ invalidLatitude: true });
      latControl?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLatitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    if (lngNum < -180 || lngNum > 180) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.INVALID_LONGITUDE'), "error");
      lngControl?.setErrors({ invalidLongitude: true });
      lngControl?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLongitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    // Update form control values to ensure they're set correctly
    latControl?.setValue(latNum);
    lngControl?.setValue(lngNum);
    
    // Now check if form is valid - this will trigger all validators
    // Force validation update
    latControl?.updateValueAndValidity();
    lngControl?.updateValueAndValidity();
    
    if (!this.questForm.valid) {
      const errors = [];
      if (this.f['picture_mystery_question']?.errors) errors.push('Question');
      if (this.f['no_of_xp']?.errors) errors.push('No of XP');
      if (this.f['no_of_crypes']?.errors) errors.push('No of Crypes');
      if (this.f['level_increase']?.errors) errors.push('Level Increase');
      if (this.f['mythica_ID']?.errors) errors.push('Mythica');
      if (this.f['latitude']?.errors) {
        if (this.f['latitude'].errors['invalidLatitude']) {
          Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.INVALID_LATITUDE'), "error");
        } else {
          errors.push(this.translate.instant('FORMS.LATITUDE'));
        }
        return;
      }
      if (this.f['longitude']?.errors) {
        if (this.f['longitude'].errors['invalidLongitude']) {
          Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.INVALID_LONGITUDE'), "error");
        } else {
          errors.push(this.translate.instant('FORMS.LONGITUDE'));
        }
        return;
      }
      
      if (errors.length > 0) {
        Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.PLEASE_FIX_ERRORS', { errors: errors.join(', ') }), "error");
      }
      return; // Don't proceed if form is invalid
    }
    
    // Additional validation for numeric fields
    if (formValue.no_of_xp <= 0 || isNaN(formValue.no_of_xp)) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.XP_MUST_BE_GREATER_THAN_ZERO'), "error");
      this.questForm.patchValue({ no_of_xp: 1 });
      return;
    }
    
    if (formValue.no_of_crypes < 0 || isNaN(formValue.no_of_crypes)) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.CRYPES_MIN'), "error");
      this.questForm.patchValue({ no_of_crypes: 0 });
      return;
    }
    
    if (formValue.level_increase < 0 || isNaN(formValue.level_increase)) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LEVEL_INCREASE_MIN'), "error");
      this.questForm.patchValue({ level_increase: 0 });
      return;
    }
    
    // Validate that at least one answer has a file and is marked as correct
    const questions = formValue.questions || [];
    let hasCorrectAnswer = false;
    let hasAnswerFiles = false;
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      // Check if answer file exists (option1, option2, etc.)
      const optionFile = i === 0 ? this.option1 : i === 1 ? this.option2 : i === 2 ? this.option3 : this.option4;
      if (optionFile) {
        hasAnswerFiles = true;
      }
      if (q.correct_option === true || q.correct_option === 'true') {
        hasCorrectAnswer = true;
        if (!optionFile) {
          Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.ANSWER_MARKED_CORRECT_NO_FILE', { index: i + 1 }), "error");
          return;
        }
      }
    }
    
    if (!hasAnswerFiles) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.AT_LEAST_ONE_ANSWER_FILE'), "error");
      return;
    }
    
    if (!hasCorrectAnswer) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.AT_LEAST_ONE_CORRECT_ANSWER'), "error");
      return;
    }
    
    // Final check - ensure form is still valid after all validations
    if (!this.questForm.valid) {
      Swal.fire(this.translate.instant('MESSAGES.VALIDATION_ERROR'), this.translate.instant('VALIDATION.FIX_ALL_FORM_ERRORS'), "error");
      return;
    }
    
    // All validations passed, submit the form
    this._sendSaveRequest(this.questForm.value);
  }

  _sendSaveRequest(formData: any) {
    this.sp.show();
    const fD = new FormData();
    fD.append('picture_mystery_question', formData?.picture_mystery_question);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('latitude', formData?.latitude);
    fD.append('longitude', formData?.longitude);
    if(this.questionPicture){
      fD.append('picture_mystery_question_url', this.questionPicture!, this.questionPicture?.name);
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
    fD.append('correct', this.correctOption);
    this.api.postImageData('pictureMystery/createPictureMystery', fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Picture Mystery Created Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['mystery/list-mystery']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire(this.translate.instant('SIDEBAR.PICTURE_MYSTERIES'), error?.error?.message || this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }

  onFileSelected(event: any, type: string) {
    if(type == 'questionPicture'){
      this.questionPicture = event.target.files[0];
    }
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
  }

  onOptionSelected($event: any, option:any){
   if($event.target.value) {
    this.correctOption = option;
   }
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }
}