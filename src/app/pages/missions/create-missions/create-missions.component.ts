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
  selector: 'app-create-missions',
  templateUrl: './create-missions.component.html',
  styleUrl: './create-missions.component.scss'
})
export class CreateMissionsComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  allCreatures: any = [];
  optionFiles: (File | undefined)[] = [];
  reward: File | undefined = undefined;

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
    if (!control.value || control.value === '') {
      return { required: true };
    }
    const lat = parseFloat(control.value);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return { invalidLatitude: true };
    }
    return null;
  }

  validateLongitude(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '') {
      return { required: true };
    }
    const lng = parseFloat(control.value);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return { invalidLongitude: true };
    }
    return null;
  }

  dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const startDate = control.get('mission_start_date')?.value;
    const endDate = control.get('mission_end_date')?.value;
    
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

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    
    this.questForm = this.fb.group({
      mission_title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      no_of_xp: [1, [Validators.required, Validators.min(1)]],
      no_of_crypes: [0, [Validators.required, Validators.min(0)]],
      level_increase: [0, [Validators.required, Validators.min(0)]],
      mythica_ID: ['', Validators.required],
      mission_latitude: ['', [Validators.required, this.validateLatitude]],
      mission_longitude: ['', [Validators.required, this.validateLongitude]],
      mission_start_date: ['', [Validators.required]],
      mission_end_date: ['', [Validators.required]],
      questions: this.fb.array([])
    }, { validators: this.dateRangeValidator });
    
    this.addQuestion();
    this.getAllCreatures()
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

  get f() { return this.questForm?.controls; }
  get questions(): FormArray {
    return this.questForm.get("questions") as FormArray
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  newQuestion(sort: any): FormGroup {
    return this.fb.group({
      quiz_title: ['', Validators.required],
      latitude: ['', [Validators.required, this.validateLatitude]],
      longitude: ['', [Validators.required, this.validateLongitude]],
      mythica: ['', Validators.required],
      mission_id: '1',
      quiz_file: 'a',
      sort,
      options: this.fb.array([
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

  addQuestion() {
    this.questions.push(this.newQuestion(this.questions.length + 1));
  }

  removeQuestion(i: number) {
    if (this.questions.length <= 1) {
      return;
    }
    this.questions.removeAt(i);
    this.optionFiles.splice(i, 1);
    this.questions.controls.forEach((ctrl, idx) => {
      ctrl.get('sort')?.setValue(idx + 1);
    });
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

  onSubmit() {
    this.submitted = true;
    
    // First check if form is valid - this will trigger all validators
    if (!this.questForm.valid) {
      const errors = [];
      if (this.f['mission_title']?.errors) errors.push('Mission Title');
      if (this.f['no_of_xp']?.errors) errors.push('No of XP');
      if (this.f['no_of_crypes']?.errors) errors.push('No of Crypes');
      if (this.f['level_increase']?.errors) errors.push('Level Increase');
      if (this.f['mythica_ID']?.errors) errors.push('Mythica');
      if (this.f['mission_latitude']?.errors) {
        if (this.f['mission_latitude'].errors['invalidLatitude']) {
          Swal.fire("Validation Error!", "Mission Latitude must be between -90 and 90", "error");
        } else {
          errors.push('Mission Latitude');
        }
        return;
      }
      if (this.f['mission_longitude']?.errors) {
        if (this.f['mission_longitude'].errors['invalidLongitude']) {
          Swal.fire("Validation Error!", "Mission Longitude must be between -180 and 180", "error");
        } else {
          errors.push('Mission Longitude');
        }
        return;
      }
      if (this.f['mission_start_date']?.errors) errors.push('Start Date');
      if (this.f['mission_end_date']?.errors) errors.push('End Date');
      
      if (errors.length > 0) {
        Swal.fire("Validation Error!", `Please fix errors in: ${errors.join(', ')}`, "error");
      }
      return; // Don't proceed if form is invalid
    }
    
    // Additional validation for numeric fields
    const formValue = this.questForm.value;
    
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
    const startDate = new Date(formValue.mission_start_date);
    const endDate = new Date(formValue.mission_end_date);
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
    
    // Validate latitude and longitude - check for empty or invalid values
    const latStr = String(formValue.mission_latitude || '').trim();
    const lngStr = String(formValue.mission_longitude || '').trim();
    
    if (!latStr || latStr === '' || latStr === '0' || latStr === '0000') {
      Swal.fire("Validation Error!", "Please enter a valid Mission Latitude (cannot be 0 or empty)", "error");
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || lngStr === '0000') {
      Swal.fire("Validation Error!", "Please enter a valid Mission Longitude (cannot be 0 or empty)", "error");
      return;
    }
    
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      Swal.fire("Validation Error!", "Mission Latitude must be between -90 and 90", "error");
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      Swal.fire("Validation Error!", "Mission Longitude must be between -180 and 180", "error");
      return;
    }
    
    // Validate quiz questions
    if (!formValue.questions?.length) {
      Swal.fire("Validation Error!", "Please add at least one question", "error");
      return;
    }
    const result = this.findEmptyFields(this.questForm?.value?.questions);
    if (result.some((question: any) => question.emptyFields.length > 0)) {
      this.clearQuestionValidators();
      const message = result.map((question: any) =>
        `Question ${question.questionNumber} is missing: ${question.emptyFields.join(', ')}.`).join('\n');
      Swal.fire("Validation Error!", message, "error");
      return;
    }
    
    // Validate quiz latitudes and longitudes
    for (let i = 0; i < formValue.questions.length; i++) {
      const q = formValue.questions[i];
      const qLatStr = String(q.latitude || '').trim();
      const qLngStr = String(q.longitude || '').trim();
      
      if (!qLatStr || qLatStr === '' || qLatStr === '0' || qLatStr === '0000') {
        Swal.fire("Validation Error!", `Quiz ${i + 1}: Please enter a valid Latitude (cannot be 0 or empty)`, "error");
        return;
      }
      
      if (!qLngStr || qLngStr === '' || qLngStr === '0' || qLngStr === '0000') {
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
    fD.append('mission_title', formData?.mission_title);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('mission_latitude', formData?.mission_latitude);
    fD.append('mission_longitude', formData?.mission_longitude);
    fD.append('mission_start_date', formData?.mission_start_date);
    fD.append('mission_end_date', formData?.mission_end_date);
    fD.append('questions', JSON.stringify(formData?.questions));
    this.optionFiles.forEach((file, index) => {
      if (file) {
        fD.append(`option${index + 1}`, file, file.name);
      }
    });
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }

    this.sp.show();
    this.api.postImageData('mission/createMissionAdmin', fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Mission Created Successfully");
        }, 1000);
        setTimeout(() => {
          this.router.navigate(['mission/list-mission']);
        }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Mission!", error?.error?.message || "There is an error, please try again", "error");
      });
  }

  onFileSelected(event: any, type: string | number) {
    if (type === 'reward') {
      this.reward = event.target.files[0];
      return;
    }
    const index = typeof type === 'number' ? type : parseInt(String(type).replace('option', ''), 10) - 1;
    if (!Number.isNaN(index) && index >= 0) {
      this.optionFiles[index] = event.target.files[0];
    }
  }

  findEmptyFields(quizData:any) {
    let emptyFieldsQuestions:any = [];

    quizData.forEach((question:any, index:any) => {
        let emptyFields = [];

        if (question.quiz_title === '') {
            emptyFields.push('quiz_title');
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
}