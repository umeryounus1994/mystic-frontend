import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';

@Component({
  selector: 'app-create-activity',
  templateUrl: './create-activity.component.html',
  styleUrl: './create-activity.component.scss'
})
export class CreateActivityComponent implements OnInit {
  activityForm!: FormGroup;
  submitted = false;
  imageFiles: File[] = [];
  categories = [
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'indoor', label: 'Indoor' },
    { value: 'educational', label: 'Educational' },
    { value: 'sports', label: 'Sports' },
    { value: 'arts', label: 'Arts' },
    { value: 'adventure', label: 'Adventure' }
  ];

  constructor(
    private fb: FormBuilder,
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private helper: HelperService,
    public router: Router
  ) {}

  ngOnInit() {
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

    this.addSlot();
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

  addSlot() {
    this.slots.push(this.createSlot());
  }

  removeSlot(index: number) {
    if (this.slots.length > 1) {
      this.slots.removeAt(index);
    }
  }

  onImageSelected(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.imageFiles = Array.from(files);
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.activityForm?.valid) {
      this._sendSaveRequest(this.activityForm.value);
    }
  }

  _sendSaveRequest(formData: any) {
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

    // Append image files
    this.imageFiles.forEach((file, index) => {
      fD.append(`images`, file, file.name);
    });

    this.api.postImageData('activity', fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Activity Created Successfully");
        }, 1000);
        setTimeout(() => {
         // this.router.navigate(['partner/list-activities']);
        }, 2000);
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || "Failed to create activity");
      });
  }
}
