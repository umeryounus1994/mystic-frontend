import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-activity',
  templateUrl: './edit-activity.component.html',
  styleUrl: './edit-activity.component.scss'
})
export class EditActivityComponent implements OnInit {
  activityForm!: FormGroup;
  submitted = false;
  activityId: string = '';
  activity: any = {};
  imageFiles: File[] = [];
  existingImages: string[] = [];
  
  categories = [
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'educational', label: 'Educational' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'others', label: 'Others' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: RestApiService,
    private sp: NgxSpinnerService,
    public translate: TranslateService,
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activityId = params['activityId'];
      if (this.activityId) {
        this.initializeForm();
        this.getActivityDetails();
      } else {
        this.router.navigate(['/partner/list-activities']);
      }
    });
  }

  initializeForm() {
    this.activityForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      category: ['', Validators.required],
      price: [1, [Validators.required, Validators.min(1)]],
      latitude: ['', [Validators.required, this.validateLatitude.bind(this)]],
      longitude: ['', [Validators.required, this.validateLongitude.bind(this)]],
      address: ['', [Validators.required, Validators.maxLength(200)]],
      duration: ['', [Validators.required, Validators.min(10)]],
      max_participants: ['', [Validators.required, Validators.min(1)]],
      slots: this.fb.array([])
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
    if (value === '0' || value === '0000' || value === '00000' || /^0+$/.test(value)) {
      event.target.value = '';
      this.activityForm.patchValue({ latitude: '' });
      this.activityForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.activityForm.get('latitude')?.markAsTouched();
    }
  }

  onLongitudeInput(event: any) {
    const value = String(event.target.value).trim();
    if (value === '0' || value === '0000' || value === '00000' || /^0+$/.test(value)) {
      event.target.value = '';
      this.activityForm.patchValue({ longitude: '' });
      this.activityForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.activityForm.get('longitude')?.markAsTouched();
    }
  }

  preventNegativeInput(event: KeyboardEvent) {
    const invalidKeys = ['-', '+', 'e', 'E'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validatePriceInput(event: any) {
    const input = event.target;
    if (input.value === '') {
      return;
    }
    const value = parseFloat(input.value);
    if (isNaN(value) || value < 1) {
      input.value = '1';
      this.activityForm.patchValue({ price: 1 });
      return;
    }
    const rounded = Math.round(value * 100) / 100;
    this.activityForm.patchValue({ price: rounded });
    // Do not set input.value = rounded.toFixed(2) here – it blocks typing values like 40
  }

  validateAvailableSpots(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value === '') {
      return null;
    }
    
    const maxParticipants = this.activityForm?.get('max_participants')?.value;
    
    if (!maxParticipants || maxParticipants === '' || isNaN(parseInt(maxParticipants, 10))) {
      return null;
    }
    
    const availableSpots = parseInt(control.value, 10);
    const maxParticipantsNum = parseInt(maxParticipants, 10);
    
    if (isNaN(availableSpots) || isNaN(maxParticipantsNum)) {
      return null;
    }
    
    if (availableSpots > maxParticipantsNum) {
      return { exceedsMaxParticipants: true };
    }
    
    return null;
  }

  onMaxParticipantsChange() {
    this.slots.controls.forEach(slot => {
      const availableSpotsControl = slot.get('available_spots');
      if (availableSpotsControl) {
        availableSpotsControl.setValidators([
          Validators.required,
          Validators.min(1),
          this.validateAvailableSpots.bind(this)
        ]);
        availableSpotsControl.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  onAvailableSpotsChange(slotIndex: number) {
    const slot = this.slots.at(slotIndex);
    const availableSpotsControl = slot.get('available_spots');
    if (availableSpotsControl) {
      availableSpotsControl.updateValueAndValidity();
    }
  }

  validateFutureDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const now = new Date();
    now.setSeconds(0, 0);
    selectedDate.setSeconds(0, 0);
    
    if (selectedDate <= now) {
      return { pastDate: true };
    }
    return null;
  }

  validateSlotDates(group: AbstractControl): ValidationErrors | null {
    const formGroup = group as FormGroup;
    const startDate = formGroup.get('start_date')?.value;
    const startTime = formGroup.get('start_time')?.value;
    const endDate = formGroup.get('end_date')?.value;
    const endTime = formGroup.get('end_time')?.value;

    if (!startDate || !startTime || !endDate || !endTime) return null;

    const start = new Date(startDate + 'T' + startTime);
    const end = new Date(endDate + 'T' + endTime);
    const now = new Date();
    now.setSeconds(0, 0);

    if (start <= now) {
      formGroup.get('start_date')?.setErrors({ pastDate: true });
      formGroup.get('start_time')?.setErrors({ pastDate: true });
      return { pastDate: true };
    }

    if (end < now) {
      formGroup.get('end_date')?.setErrors({ pastDate: true });
      formGroup.get('end_time')?.setErrors({ pastDate: true });
      return { pastDate: true };
    }

    if (end <= start) {
      formGroup.get('end_date')?.setErrors({ endBeforeStart: true });
      formGroup.get('end_time')?.setErrors({ endBeforeStart: true });
      return { endBeforeStart: true };
    }

    formGroup.get('start_date')?.setErrors(null);
    formGroup.get('start_time')?.setErrors(null);
    formGroup.get('end_date')?.setErrors(null);
    formGroup.get('end_time')?.setErrors(null);

    return null;
  }

  getMinDate(): string {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  getMinEndTime(slotIndex: number): string {
    const slot = this.slots.at(slotIndex);
    const startDate = slot?.get('start_date')?.value;
    const endDate = slot?.get('end_date')?.value;
    if (startDate && endDate && startDate === endDate) {
      return slot?.get('start_time')?.value || '';
    }
    return '';
  }

  getActivityDetails() {
    this.sp.show();
    this.api.get(`activity/${this.activityId}`)
      .then((response: any) => {
        this.sp.hide();
        this.activity = response?.data || {};
        this.populateForm();
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_LOAD_ACTIVITY'));
        this.router.navigate(['/partner/list-activities']);
      });
  }

  populateForm() {
    this.activityForm.patchValue({
      title: this.activity.title,
      description: this.activity.description,
      category: this.activity.category,
      price: this.activity.price || 1,
      latitude: this.activity.location?.coordinates[1],
      longitude: this.activity.location?.coordinates[0],
      address: this.activity.address,
      duration: this.activity.duration,
      max_participants: this.activity.max_participants
    });

    // Store existing images
    this.existingImages = this.activity.images || [];

    // Populate slots
    this.clearSlots();
    if (this.activity.slots && this.activity.slots.length > 0) {
      this.activity.slots.forEach((slot: any) => {
        this.slots.push(this.createSlotFromData(slot));
      });
    } else {
      this.addSlot();
    }
  }

  get f() { return this.activityForm?.controls; }
  
  get slots(): FormArray {
    return this.activityForm.get('slots') as FormArray;
  }

  createSlot(): FormGroup {
    return this.fb.group({
      start_date: ['', Validators.required],
      start_time: ['', Validators.required],
      end_date: ['', Validators.required],
      end_time: ['', Validators.required],
      available_spots: ['', [Validators.required, Validators.min(1)]]
    }, { validators: this.validateSlotDates.bind(this) });
  }

  createSlotFromData(slot: any): FormGroup {
    const startDt = new Date(slot.start_time);
    const endDt = new Date(slot.end_time);
    const start_date = startDt.toISOString().slice(0, 10);
    const start_time = startDt.toISOString().slice(11, 16);
    const end_date = endDt.toISOString().slice(0, 10);
    const end_time = endDt.toISOString().slice(11, 16);

    const slotGroup = this.fb.group({
      _id: [slot._id],
      start_date: [start_date, Validators.required],
      start_time: [start_time, Validators.required],
      end_date: [end_date, Validators.required],
      end_time: [end_time, Validators.required],
      available_spots: [slot.available_spots, [Validators.required, Validators.min(1)]]
    }, { validators: this.validateSlotDates.bind(this) });

    const availableSpotsControl = slotGroup.get('available_spots');
    if (availableSpotsControl) {
      availableSpotsControl.setValidators([
        Validators.required,
        Validators.min(1),
        this.validateAvailableSpots.bind(this)
      ]);
    }

    return slotGroup;
  }

  addSlot() {
    const newSlot = this.createSlot();
    this.slots.push(newSlot);
    
    // Add available_spots validator after slot is created
    const availableSpotsControl = newSlot.get('available_spots');
    if (availableSpotsControl) {
      availableSpotsControl.setValidators([
        Validators.required,
        Validators.min(1),
        this.validateAvailableSpots.bind(this)
      ]);
      availableSpotsControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  removeSlot(index: number) {
    if (this.slots.length > 1) {
      this.slots.removeAt(index);
    }
  }

  clearSlots() {
    while (this.slots.length !== 0) {
      this.slots.removeAt(0);
    }
  }

  onImageSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.imageFiles = Array.from(files);
    }
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  onSubmit() {
    this.submitted = true;
    
    // First, validate price - must be >= 1
    const formValue = this.activityForm.value;
    const price = parseFloat(formValue.price);
    if (isNaN(price) || price < 1) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.PRICE_MIN'), "error");
      this.activityForm.get('price')?.setErrors({ min: true });
      this.activityForm.get('price')?.markAsTouched();
      return;
    }
    
    // Validate category
    if (!formValue.category || formValue.category === '') {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.REQUIRED'), "error");
      this.activityForm.get('category')?.setErrors({ required: true });
      this.activityForm.get('category')?.markAsTouched();
      return;
    }
    
    // Validate address
    if (!formValue.address || formValue.address.trim() === '') {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.REQUIRED'), "error");
      this.activityForm.get('address')?.setErrors({ required: true });
      this.activityForm.get('address')?.markAsTouched();
      return;
    }
    
    // Validate duration - must be at least 10 minutes
    const duration = parseInt(formValue.duration, 10);
    if (isNaN(duration) || duration < 10) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.DURATION_MIN'), "error");
      this.activityForm.get('duration')?.setErrors({ min: true });
      this.activityForm.get('duration')?.markAsTouched();
      return;
    }
    
    // Validate max_participants - must be at least 1
    const maxParticipants = parseInt(formValue.max_participants, 10);
    if (isNaN(maxParticipants) || maxParticipants < 1) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.MAX_PARTICIPANTS_MIN'), "error");
      this.activityForm.get('max_participants')?.setErrors({ min: true });
      this.activityForm.get('max_participants')?.markAsTouched();
      return;
    }
    
    // Validate latitude and longitude for "0" and "0000" values BEFORE form validation
    const latStr = String(formValue.latitude || '').trim();
    const lngStr = String(formValue.longitude || '').trim();
    
    if (!latStr || latStr === '' || latStr === '0' || latStr === '0000' || latStr === '00000' || /^0+$/.test(latStr)) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_VALID_NOT_ZERO'), "error");
      this.activityForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.activityForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || lngStr === '0000' || lngStr === '00000' || /^0+$/.test(lngStr)) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_VALID_NOT_ZERO'), "error");
      this.activityForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.activityForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Validate latitude and longitude ranges
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    if (isNaN(lat) || lat < -90 || lat > 90 || lat === 0 || Math.abs(lat) < 0.0001) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LATITUDE_REQUIRED_VALID'), "error");
      this.activityForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.activityForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180 || lng === 0 || Math.abs(lng) < 0.0001) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.LONGITUDE_REQUIRED_VALID'), "error");
      this.activityForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.activityForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Validate all time slots (build datetime from start_date, start_time, end_date, end_time)
    for (let i = 0; i < formValue.slots.length; i++) {
      const slot = formValue.slots[i];
      const startDateTime = new Date(slot.start_date + 'T' + slot.start_time);
      const endDateTime = new Date(slot.end_date + 'T' + slot.end_time);
      const now = new Date();
      now.setSeconds(0, 0);

      const slotControl = this.slots.at(i);

      if (startDateTime <= now) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('FORMS.SLOT')} ${i + 1}: ${this.translate.instant('VALIDATION.START_TIME_PAST')}`, "error");
        slotControl.get('start_date')?.setErrors({ pastDate: true });
        slotControl.get('start_time')?.setErrors({ pastDate: true });
        slotControl.get('start_date')?.markAsTouched();
        slotControl.get('start_time')?.markAsTouched();
        return;
      }

      if (endDateTime < now) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('FORMS.SLOT')} ${i + 1}: ${this.translate.instant('VALIDATION.END_TIME_PAST')}`, "error");
        slotControl.get('end_date')?.setErrors({ pastDate: true });
        slotControl.get('end_time')?.setErrors({ pastDate: true });
        slotControl.get('end_date')?.markAsTouched();
        slotControl.get('end_time')?.markAsTouched();
        return;
      }

      if (endDateTime <= startDateTime) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('FORMS.SLOT')} ${i + 1}: ${this.translate.instant('VALIDATION.END_TIME_BEFORE_START')}`, "error");
        slotControl.get('end_date')?.setErrors({ endBeforeStart: true });
        slotControl.get('end_time')?.setErrors({ endBeforeStart: true });
        slotControl.get('end_date')?.markAsTouched();
        slotControl.get('end_time')?.markAsTouched();
        return;
      }
      
      // Validate available_spots is not greater than max_participants
      const availableSpots = parseInt(slot.available_spots, 10);
      if (isNaN(availableSpots) || availableSpots < 1) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('FORMS.SLOT')} ${i + 1}: ${this.translate.instant('VALIDATION.AVAILABLE_SPOTS_MIN')}`, "error");
        const slotControl = this.slots.at(i);
        slotControl.get('available_spots')?.setErrors({ min: true });
        slotControl.get('available_spots')?.markAsTouched();
        return;
      }
      
      // Check if available_spots exceeds max_participants
      if (availableSpots > maxParticipants) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('FORMS.SLOT')} ${i + 1}: ${this.translate.instant('VALIDATION.AVAILABLE_SPOTS_EXCEED')}`, "error");
        const slotControl = this.slots.at(i);
        slotControl.get('available_spots')?.setErrors({ exceedsMaxParticipants: true });
        slotControl.get('available_spots')?.markAsTouched();
        return;
      }
    }
    
    // Check form validity AFTER all custom validations
    if (!this.activityForm?.valid) {
      const errors = [];
      if (this.f['title']?.errors) errors.push(this.translate.instant('FORMS.ACTIVITY_TITLE'));
      if (this.f['description']?.errors) errors.push(this.translate.instant('COMMON.DESCRIPTION'));
      if (this.f['price']?.errors) errors.push(this.translate.instant('TABLES.PRICE'));
      if (this.f['category']?.errors) errors.push(this.translate.instant('COMMON.CATEGORY'));
      if (this.f['address']?.errors) errors.push(this.translate.instant('FORMS.ACTIVITY_ADDRESS'));
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
      if (this.f['duration']?.errors) errors.push(this.translate.instant('FORMS.ACTIVITY_DURATION'));
      if (this.f['max_participants']?.errors) errors.push(this.translate.instant('FORMS.MAX_PARTICIPANTS'));
      
      // Check for slot errors
      for (let i = 0; i < this.slots.length; i++) {
        const slot = this.slots.at(i);
        if (slot.get('available_spots')?.errors?.['exceedsMaxParticipants']) {
          Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('FORMS.SLOT')} ${i + 1}: ${this.translate.instant('VALIDATION.AVAILABLE_SPOTS_EXCEED')}`, "error");
          return;
        }
      }
      
      if (errors.length > 0) {
        Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), `${this.translate.instant('VALIDATION.PLEASE_FIX_ERRORS')}: ${errors.join(', ')}`, "error");
      }
      return; // Don't proceed if form is invalid
    }
    
    // All validations passed, submit the form
    this._sendUpdateRequest(this.activityForm.value);
  }

  _sendUpdateRequest(formData: any) {
    this.sp.show();
    const fD = new FormData();
    
    fD.append('title', formData?.title);
    fD.append('description', formData?.description);
    fD.append('category', formData?.category);
    fD.append('price', formData?.price);
    fD.append('latitude', formData?.latitude);
    fD.append('longitude', formData?.longitude);
    fD.append('address', formData?.address);
    fD.append('duration', formData?.duration);
    fD.append('max_participants', formData?.max_participants);
    const slotsPayload = (formData?.slots || []).map((s: any) => ({
      ...(s._id ? { _id: s._id } : {}),
      start_time: new Date(s.start_date + 'T' + s.start_time).toISOString(),
      end_time: new Date(s.end_date + 'T' + s.end_time).toISOString(),
      available_spots: s.available_spots
    }));
    fD.append('slots', JSON.stringify(slotsPayload));
    fD.append('existing_images', JSON.stringify(this.existingImages));

    // Append new image files
    this.imageFiles.forEach((file, index) => {
      fD.append(`images`, file, file.name);
    });

    this.api.postImageData(`activity/${this.activityId}`, fD)
      .then((response: any) => {
        this.sp.hide();
        this.helper.successToast(this.translate.instant('MESSAGES.ACTIVITY_UPDATED_SUCCESS'));
        setTimeout(() => {
          this.router.navigate(['/partner/view-activity'], { queryParams: { activityId: this.activityId } });
        }, 1000);
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_UPDATE_ACTIVITY'));
      });
  }

  goBack() {
    this.router.navigate(['/partner/view-activity'], { queryParams: { activityId: this.activityId } });
  }
}
