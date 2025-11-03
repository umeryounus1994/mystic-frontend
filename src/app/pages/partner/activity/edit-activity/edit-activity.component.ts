import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';

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
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
      address: ['', Validators.required],
      duration: ['', [Validators.required, Validators.min(15)]],
      max_participants: ['', [Validators.required, Validators.min(1)]],
      slots: this.fb.array([])
    });
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
        this.helper.failureToast(error?.error?.message || 'Failed to load activity details');
        this.router.navigate(['/partner/list-activities']);
      });
  }

  populateForm() {
    this.activityForm.patchValue({
      title: this.activity.title,
      description: this.activity.description,
      category: this.activity.category,
      price: this.activity.price,
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
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      available_spots: ['', [Validators.required, Validators.min(1)]]
    });
  }

  createSlotFromData(slot: any): FormGroup {
    return this.fb.group({
      _id: [slot._id],
      start_time: [new Date(slot.start_time).toISOString().slice(0, 16)],
      end_time: [new Date(slot.end_time).toISOString().slice(0, 16)],
      available_spots: [slot.available_spots, [Validators.required, Validators.min(1)]]
    });
  }

  addSlot() {
    this.slots.push(this.createSlot());
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
    if (this.activityForm?.valid) {
      this._sendUpdateRequest(this.activityForm.value);
    }
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
    fD.append('slots', JSON.stringify(formData?.slots));
    fD.append('existing_images', JSON.stringify(this.existingImages));

    // Append new image files
    this.imageFiles.forEach((file, index) => {
      fD.append(`images`, file, file.name);
    });

    this.api.postImageData(`activity/${this.activityId}`, fD)
      .then((response: any) => {
        this.sp.hide();
        this.helper.successToast("Activity Updated Successfully");
        setTimeout(() => {
          this.router.navigate(['/partner/view-activity'], { queryParams: { activityId: this.activityId } });
        }, 1000);
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || "Failed to update activity");
      });
  }

  goBack() {
    this.router.navigate(['/partner/view-activity'], { queryParams: { activityId: this.activityId } });
  }
}
