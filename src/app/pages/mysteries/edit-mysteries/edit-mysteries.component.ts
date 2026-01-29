import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-edit-mysteries',
  templateUrl: './edit-mysteries.component.html',
  styleUrl: './edit-mysteries.component.scss'
})
export class EditMysteriesComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  questionPicture: File | undefined = undefined;
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  correctOption = '';
  Id = '';
  
  // Store existing file URLs
  existingQuestionPicture = '';
  existingOption1 = '';
  existingOption2 = '';
  existingOption3 = '';
  existingOption4 = '';
  
  constructor(
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private helper: HelperService,
    public router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private auth: AuthService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && Object.keys(params).length > 0) {
        this.Id = params['Id'];
      }
    });
  }

  // Custom validators
  validateLatitude(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '' || control.value === null || control.value === undefined) {
      return { required: true };
    }
    
    const valueStr = String(control.value).trim();
    if (valueStr === '' || valueStr === '0' || valueStr === '0000') {
      return { invalidLatitude: true };
    }
    
    const lat = parseFloat(control.value);
    if (isNaN(lat) || lat < -90 || lat > 90 || lat === 0) {
      return { invalidLatitude: true };
    }
    return null;
  }

  validateLongitude(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '' || control.value === null || control.value === undefined) {
      return { required: true };
    }
    
    const valueStr = String(control.value).trim();
    if (valueStr === '' || valueStr === '0' || valueStr === '0000') {
      return { invalidLongitude: true };
    }
    
    const lng = parseFloat(control.value);
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
    
    if (value === '0' || value === '0000' || value === '00' || numValue === 0 || (value && Math.abs(numValue) < 0.0001)) {
      event.target.value = '';
      this.questForm.get('latitude')?.setValue('');
      this.questForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.questForm.get('latitude')?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLatitude: true });
    } else if (value && !isNaN(numValue)) {
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
    
    if (value === '0' || value === '0000' || value === '00' || numValue === 0 || (value && Math.abs(numValue) < 0.0001)) {
      event.target.value = '';
      this.questForm.get('longitude')?.setValue('');
      this.questForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.questForm.get('longitude')?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLongitude: true });
    } else if (value && !isNaN(numValue)) {
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
    const perms = this.auth.user?.permissions || [];
    const canAccess = this.auth.isAdmin || this.auth.isPartner || perms.includes('All') || perms.includes('Picture Mysteries');
    if (!canAccess) {
      this.helper.warningToast('You do not have permission to access Picture Mysteries.');
      this.router.navigate(['/dashboard/admin']);
      return;
    }
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
    this.getAllCreatures();
    this.getProductDetails();
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
    if (this.questions().length > 1) {
      this.questions().removeAt(i);
    } else {
      Swal.fire("Warning!", "At least one answer is required", "warning");
    }
  } 

  getProductDetails() {
    this.sp.show();
    this.api.get('pictureMystery/get_picture_mystery_by_id/' + this.Id)
      .then((response: any) => {
        this.sp.hide();
        const data = response?.data;
        
        // Set form values
        this.questForm.controls['picture_mystery_question'].setValue(data?.picture_mystery_question || '');
        this.questForm.controls['no_of_xp'].setValue(data?.no_of_xp || 1);
        this.questForm.controls['no_of_crypes'].setValue(data?.no_of_crypes || 0);
        this.questForm.controls['level_increase'].setValue(data?.level_increase || 0);
        this.questForm.controls['mythica_ID'].setValue(data?.mythica_ID?._id || data?.mythica_ID || '');
        
        // Handle location coordinates
        if (data?.location?.coordinates) {
          this.questForm.controls['latitude'].setValue(data.location.coordinates[1] || data.location.coordinates[0]);
          this.questForm.controls['longitude'].setValue(data.location.coordinates[0] || data.location.coordinates[1]);
        } else if (data?.latitude && data?.longitude) {
          this.questForm.controls['latitude'].setValue(data.latitude);
          this.questForm.controls['longitude'].setValue(data.longitude);
        }
        
        // Store existing file URLs
        this.existingQuestionPicture = data?.picture_mystery_question_url || '';
        
        // Load questions/options
        if (data?.options && data.options.length > 0) {
          // Clear existing questions
          while (this.questions().length !== 0) {
            this.questions().removeAt(0);
          }
          
          data.options.forEach((option: any, index: number) => {
            const questionGroup = this.fb.group({
              answer: [option.answer_image || '', Validators.required],
              correct_option: [option.is_correct || false],
              quest_id: [option._id || '']
            });
            this.questions().push(questionGroup);
            
            // Store existing option file URLs
            if (index === 0) this.existingOption1 = option.answer_image || '';
            if (index === 1) this.existingOption2 = option.answer_image || '';
            if (index === 2) this.existingOption3 = option.answer_image || '';
            if (index === 3) this.existingOption4 = option.answer_image || '';
            
            // Set correct option
            if (option.is_correct) {
              this.correctOption = 'option' + (index + 1);
            }
          });
        } else {
          // If no questions exist, add one
          this.addQuestion();
        }
      })
      .catch((error: any) => {
        this.sp.hide();
        Swal.fire("Error!", "Failed to load mystery details", "error");
        console.error('Error loading mystery details:', error);
      });
  }

  onSubmit(){
    this.submitted = true;
    
    const formValue = this.questForm.value;
    
    // Validate latitude and longitude FIRST
    const latInput = document.querySelector('[formControlName="latitude"]') as HTMLInputElement;
    const lngInput = document.querySelector('[formControlName="longitude"]') as HTMLInputElement;
    
    const latControl = this.questForm.get('latitude');
    const lngControl = this.questForm.get('longitude');
    
    const latRawValue = latInput?.value || latControl?.value || '';
    const lngRawValue = lngInput?.value || lngControl?.value || '';
    
    const latStr = String(latRawValue).trim();
    const lngStr = String(lngRawValue).trim();
    
    const latNum = parseFloat(latStr);
    const lngNum = parseFloat(lngStr);
    
    if (!latStr || latStr === '' || latStr === '0' || latStr === '0000' || latNum === 0 || isNaN(latNum) || Math.abs(latNum) < 0.0001) {
      Swal.fire("Validation Error!", "Please enter a valid Latitude (cannot be 0 or empty)", "error");
      latControl?.setErrors({ invalidLatitude: true });
      latControl?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLatitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || lngStr === '0000' || lngNum === 0 || isNaN(lngNum) || Math.abs(lngNum) < 0.0001) {
      Swal.fire("Validation Error!", "Please enter a valid Longitude (cannot be 0 or empty)", "error");
      lngControl?.setErrors({ invalidLongitude: true });
      lngControl?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLongitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    if (latNum < -90 || latNum > 90) {
      Swal.fire("Validation Error!", "Latitude must be between -90 and 90", "error");
      latControl?.setErrors({ invalidLatitude: true });
      latControl?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLatitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    if (lngNum < -180 || lngNum > 180) {
      Swal.fire("Validation Error!", "Longitude must be between -180 and 180", "error");
      lngControl?.setErrors({ invalidLongitude: true });
      lngControl?.markAsTouched();
      this.questForm.setErrors({ ...this.questForm.errors, invalidLongitude: true });
      this.questForm.markAllAsTouched();
      return;
    }
    
    latControl?.setValue(latNum);
    lngControl?.setValue(lngNum);
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
          Swal.fire("Validation Error!", "Latitude must be between -90 and 90 (cannot be 0)", "error");
        } else {
          errors.push('Latitude');
        }
        return;
      }
      if (this.f['longitude']?.errors) {
        if (this.f['longitude'].errors['invalidLongitude']) {
          Swal.fire("Validation Error!", "Longitude must be between -180 and 180 (cannot be 0)", "error");
        } else {
          errors.push('Longitude');
        }
        return;
      }
      
      if (errors.length > 0) {
        Swal.fire("Validation Error!", `Please fix errors in: ${errors.join(', ')}`, "error");
      }
      return;
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
    
    // Validate that at least one answer has a file and is marked as correct
    const questions = formValue.questions || [];
    let hasCorrectAnswer = false;
    let hasAnswerFiles = false;
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const optionFile = i === 0 ? this.option1 : i === 1 ? this.option2 : i === 2 ? this.option3 : this.option4;
      const existingFile = i === 0 ? this.existingOption1 : i === 1 ? this.existingOption2 : i === 2 ? this.existingOption3 : this.existingOption4;
      
      if (optionFile || existingFile) {
        hasAnswerFiles = true;
      }
      if (q.correct_option === true || q.correct_option === 'true') {
        hasCorrectAnswer = true;
        if (!optionFile && !existingFile) {
          Swal.fire("Validation Error!", `Answer ${i + 1} is marked as correct but no file is uploaded`, "error");
          return;
        }
      }
    }
    
    if (!hasAnswerFiles) {
      Swal.fire("Validation Error!", "At least one answer file is required", "error");
      return;
    }
    
    if (!hasCorrectAnswer) {
      Swal.fire("Validation Error!", "At least one answer must be marked as correct", "error");
      return;
    }
    
    if (!this.questForm.valid) {
      Swal.fire("Validation Error!", "Please fix all form errors before submitting", "error");
      return;
    }
    
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
    
    this.api.patch('pictureMystery/' + this.Id, fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Picture Mystery Updated Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['mystery/list-mystery']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Picture Mystery!", error?.error?.message || "There is an error, please try again", "error");
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
