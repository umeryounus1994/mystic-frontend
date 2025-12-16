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
  selector: 'app-create-hunt',
  templateUrl: './create-hunt.component.html',
  styleUrl: './create-hunt.component.scss'
})
export class CreateHuntComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  option5: File | undefined = undefined;
  reward: File | undefined = undefined;
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";

  constructor(
    private api: RestApiService, 
    private sp: NgxSpinnerService, 
    private helper: HelperService,
    public router: Router, 
    private fb: FormBuilder, 
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
      this.QrCode = Math.floor(new Date().valueOf() * Math.random()).toString()+(new Date().getTime()).toString(36);
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
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

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('treasure_hunt_start_date')?.value;
    const endDate = control.get('treasure_hunt_end_date')?.value;
    
    if (!startDate || !endDate) {
      return null;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if start date is in the past
    if (start < today) {
      return { pastStartDate: true };
    }
    
    // Check if end date is before start date
    if (end < start) {
      return { endBeforeStart: true };
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

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.questForm = this.fb.group({
      treasure_hunt_title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      no_of_xp: [1, [Validators.required, Validators.min(1)]],
      no_of_crypes: [0, [Validators.required, Validators.min(0)]],
      level_increase: [0, [Validators.required, Validators.min(0)]],
      mythica_ID: ['', Validators.required],
      hunt_latitude: ['', [Validators.required, this.validateLatitude]],
      hunt_longitude: ['', [Validators.required, this.validateLongitude]],
      premium_hunt: [false],
      have_qr: [false],
      hunt_package: [],
      qr_code: [this.QrCode],
      treasure_hunt_start_date: ['', [Validators.required]],
      treasure_hunt_end_date: ['', [Validators.required]],
      questions: this.fb.array([])
    }, { validators: this.dateRangeValidator });
    
    this.addQuestion(1);
    this.addQuestion(2);
    this.addQuestion(3);
    this.addQuestion(4);
    this.addQuestion(5);
    this.getAllCreatures()
  }

  get f() { return this.questForm?.controls; }
  get questions() : FormArray {  
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
     
  newQuestion(sort:any): FormGroup {  
    return this.fb.group({  
      treasure_hunt_title: ['', Validators.required],  
      latitude: ['', [Validators.required, this.validateLatitude]],
      longitude: ['', [Validators.required, this.validateLongitude]],
      mythica: ['', Validators.required],
      treasure_hunt_id: '1',
      sort,
      options: this.fb.array([
        this.createOption(), 
        this.createOption(), 
        this.createOption(), 
        this.createOption()
      ])
    })  
  }  

  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  createOption(): FormGroup {
    return this.fb.group({
      option: ['', Validators.required],
      correct: [false]
    });
  }
     
  addQuestion(sort:any) {  
    this.questions.push(this.newQuestion(sort));  
  }  
     
  removeQuestion(i:number) {  
    this.questions.removeAt(i);  
  } 

  clearQuestionValidators() {
    const questionsArray = this.questForm.get('questions') as FormArray;
    questionsArray.controls.forEach(control => {
      control.clearValidators();
      control.updateValueAndValidity();
    });
    questionsArray.clearValidators();
    questionsArray.updateValueAndValidity();
  }

  onSubmit(){
    this.submitted = true;
    
    // Additional validation for numeric fields FIRST (before form validation check)
    const formValue = this.questForm.value;
    
    // Validate latitude and longitude FIRST - check for empty, zero, or invalid values
    const latControl = this.questForm.get('hunt_latitude');
    const lngControl = this.questForm.get('hunt_longitude');
    const latRawValue = latControl?.value;
    const lngRawValue = lngControl?.value;
    
    // Convert to string to check original input
    const latStr = String(latRawValue || '').trim();
    const lngStr = String(lngRawValue || '').trim();
    
    // Check if empty or zero (including "0", "0000", etc.) - do this BEFORE form validation
    if (!latStr || latStr === '' || latStr === '0' || parseFloat(latStr) === 0 || latStr === '0000') {
      Swal.fire("Validation Error!", "Please enter a valid Hunt Latitude (cannot be 0 or empty)", "error");
      latControl?.setErrors({ invalidLatitude: true });
      latControl?.markAsTouched();
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || parseFloat(lngStr) === 0 || lngStr === '0000') {
      Swal.fire("Validation Error!", "Please enter a valid Hunt Longitude (cannot be 0 or empty)", "error");
      lngControl?.setErrors({ invalidLongitude: true });
      lngControl?.markAsTouched();
      return;
    }
    
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      Swal.fire("Validation Error!", "Hunt Latitude must be between -90 and 90", "error");
      latControl?.setErrors({ invalidLatitude: true });
      latControl?.markAsTouched();
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      Swal.fire("Validation Error!", "Hunt Longitude must be between -180 and 180", "error");
      lngControl?.setErrors({ invalidLongitude: true });
      lngControl?.markAsTouched();
      return;
    }
    
    // Now check if form is valid - this will trigger all validators
    if (!this.questForm.valid) {
      const errors = [];
      if (this.f['treasure_hunt_title']?.errors) errors.push('Treasure Hunt Title');
      if (this.f['no_of_xp']?.errors) errors.push('No of XP');
      if (this.f['no_of_crypes']?.errors) errors.push('No of Crypes');
      if (this.f['level_increase']?.errors) errors.push('Level Increase');
      if (this.f['mythica_ID']?.errors) errors.push('Mythica');
      if (this.f['hunt_latitude']?.errors) {
        if (this.f['hunt_latitude'].errors['invalidLatitude']) {
          Swal.fire("Validation Error!", "Hunt Latitude must be between -90 and 90 (cannot be 0)", "error");
        } else {
          errors.push('Hunt Latitude');
        }
        return;
      }
      if (this.f['hunt_longitude']?.errors) {
        if (this.f['hunt_longitude'].errors['invalidLongitude']) {
          Swal.fire("Validation Error!", "Hunt Longitude must be between -180 and 180 (cannot be 0)", "error");
        } else {
          errors.push('Hunt Longitude');
        }
        return;
      }
      if (this.f['treasure_hunt_start_date']?.errors) errors.push('Start Date');
      if (this.f['treasure_hunt_end_date']?.errors) errors.push('End Date');
      
      if (errors.length > 0) {
        Swal.fire("Validation Error!", `Please fix errors in: ${errors.join(', ')}`, "error");
      }
      return; // Don't proceed if form is invalid
    }
    
    // Additional validation for numeric fields
    if (formValue.no_of_xp <= 0 || isNaN(formValue.no_of_xp)) {
      Swal.fire("Validation Error!", "No of XP must be greater than 0", "error");
      this.questForm.patchValue({ no_of_xp: 1 });
      return;
    }
    
    if (formValue.no_of_crypes < 0 || isNaN(formValue.no_of_crypes)) {
      Swal.fire("Validation Error!", "No of Crypes cannot be negative", "error");
      this.questForm.patchValue({ no_of_crypes: 0 });
      return;
    }
    
    if (formValue.level_increase < 0 || isNaN(formValue.level_increase)) {
      Swal.fire("Validation Error!", "Level Increase cannot be negative", "error");
      this.questForm.patchValue({ level_increase: 0 });
      return;
    }
    
    // Validate dates
    const startDate = new Date(formValue.treasure_hunt_start_date);
    const endDate = new Date(formValue.treasure_hunt_end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      Swal.fire("Validation Error!", "Start date cannot be in the past", "error");
      return;
    }
    
    if (endDate < startDate) {
      Swal.fire("Validation Error!", "End date cannot be before start date", "error");
      return;
    }
    
    // Validate quiz questions
    const result = this.findEmptyFields(this.questForm?.value?.questions);
    if(result.length > 0){
      if(result[0]?.emptyFields.length > 0 || result[1]?.emptyFields.length > 0 || result[2]?.emptyFields.length > 0 || result[3]?.emptyFields.length > 0 || result[4]?.emptyFields.length > 0) {
        this.clearQuestionValidators();
        let message = result.map((question:any) => 
          `Question ${question.questionNumber} is missing: ${question.emptyFields.join(', ')}.`).join('\n');
        Swal.fire("Validation Error!", message, "error");
        return;
      }
    }
    
    // Validate quiz latitudes and longitudes
    for (let i = 0; i < formValue.questions.length; i++) {
      const q = formValue.questions[i];
      const qLatStr = String(q.latitude || '').trim();
      const qLngStr = String(q.longitude || '').trim();
      
      // Check for zero values
      if (!qLatStr || qLatStr === '' || qLatStr === '0' || parseFloat(qLatStr) === 0 || qLatStr === '0000') {
        Swal.fire("Validation Error!", `Quiz ${i + 1}: Please enter a valid Latitude (cannot be 0 or empty)`, "error");
        return;
      }
      
      if (!qLngStr || qLngStr === '' || qLngStr === '0' || parseFloat(qLngStr) === 0 || qLngStr === '0000') {
        Swal.fire("Validation Error!", `Quiz ${i + 1}: Please enter a valid Longitude (cannot be 0 or empty)`, "error");
        return;
      }
      
      const qLat = parseFloat(qLatStr);
      const qLng = parseFloat(qLngStr);
      
      if (isNaN(qLat) || qLat < -90 || qLat > 90) {
        Swal.fire("Validation Error!", `Quiz ${i + 1}: Latitude must be between -90 and 90`, "error");
        return;
      }
      
      if (isNaN(qLng) || qLng < -180 || qLng > 180) {
        Swal.fire("Validation Error!", `Quiz ${i + 1}: Longitude must be between -180 and 180`, "error");
        return;
      }
    }
    
    // All validations passed, submit the form
    this._sendSaveRequest(this.questForm.value);
  }

  _sendSaveRequest(formData: any) {
    const fD = new FormData();
    fD.append('treasure_hunt_title', formData?.treasure_hunt_title);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('hunt_latitude', formData?.hunt_latitude);
    fD.append('hunt_longitude', formData?.hunt_longitude);
    fD.append('premium_hunt', formData?.premium_hunt);
    fD.append('hunt_package', formData?.hunt_package);
    fD.append('treasure_hunt_start_date', formData?.treasure_hunt_start_date);
    fD.append('treasure_hunt_end_date', formData?.treasure_hunt_end_date);
    fD.append('have_qr', formData?.have_qr);
    if(formData?.have_qr === 'true'){
      fD.append('qr_code', formData?.qr_code);
    }
    fD.append('questions', JSON.stringify(formData?.questions));
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
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }
    this.sp.show();
    this.api.postImageData('hunt/createTreasureHuntAdmin', fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Treasure Hunt Created Successfully");
        }, 1000);
        setTimeout(() => {
          this.router.navigate(['hunt/list-hunt']);
        }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Treasure Hunt!", error?.error?.message || "There is an error, please try again", "error");
      });
  }

  findEmptyFields(quizData:any) {
    let emptyFieldsQuestions:any = [];

    quizData.forEach((question:any, index:any) => {
        let emptyFields = [];

        if (question.treasure_hunt_title === '') {
            emptyFields.push('treasure_hunt_title');
        }
        if (question.latitude === '') {
          emptyFields.push('latitude');
        }
         if (question.longitude === '') {
          emptyFields.push('longitude');
        }
        if (question.mythica === '') {
            emptyFields.push('mythica');
        }

        question.options.forEach((option:any, optIndex:any) => {
            if (option.option === '') {
                emptyFields.push(`option ${optIndex + 1}`);
            }
        });

        if (emptyFields.length > 0) {
            emptyFieldsQuestions.push({
                questionNumber: index + 1,
                emptyFields: emptyFields
            });
        }
    });

    return emptyFieldsQuestions;
  }

  onFileSelected(event: any, type: string) {
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
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }
}