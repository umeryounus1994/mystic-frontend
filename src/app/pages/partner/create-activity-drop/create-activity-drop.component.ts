import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-activity-drop',
  templateUrl: './create-activity-drop.component.html',
  styleUrl: './create-activity-drop.component.scss'
})
export class CreateActivityDropComponent implements OnInit {
  dropForm: FormGroup | any;
  submitted = false;
  allActivities: any = [];
  dropImage: File | undefined = undefined;

  constructor(
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private helper: HelperService,
    public router: Router,
    private fb: FormBuilder,
    private auth: AuthService
  ) {}

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
      this.dropForm.patchValue({ latitude: '' });
      this.dropForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.dropForm.get('latitude')?.markAsTouched();
    }
  }

  onLongitudeInput(event: any) {
    const value = String(event.target.value).trim();
    if (value === '0' || value === '0000' || value === '00000' || /^0+$/.test(value)) {
      event.target.value = '';
      this.dropForm.patchValue({ longitude: '' });
      this.dropForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.dropForm.get('longitude')?.markAsTouched();
    }
  }

  ngOnInit() {
    this.dropForm = this.fb.group({
      drop_name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      drop_description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      latitude: ['', [Validators.required, this.validateLatitude.bind(this)]],
      longitude: ['', [Validators.required, this.validateLongitude.bind(this)]],
      activity_id: ['', Validators.required]
    });

    this.getAllActivities();
  }

  get f() { return this.dropForm?.controls; }

  getAllActivities() {
    this.allActivities = [];
    
    let endpoint = 'activity/';
    if (this.auth.isPartner) {
      endpoint += `?partner_id=${this.auth.user._id}&status=approved`;
    } else if (this.auth.isAdmin) {
      endpoint += '?status=approved';
    }

    this.api.get(endpoint)
      .then((response: any) => {
        this.allActivities = response?.data?.activities || response?.data || [];
      }).catch((error: any) => {
        console.error('Error loading activities:', error);
        this.helper.failureToast('Failed to load activities');
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.helper.failureToast('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.helper.failureToast('Image size should be less than 5MB');
        return;
      }

      this.dropImage = file;
    }
  }

  onSubmit() {
    this.submitted = true;
    
    // First, validate latitude and longitude for "0" and "0000" values BEFORE form validation
    const formValue = this.dropForm.value;
    const latStr = String(formValue.latitude || '').trim();
    const lngStr = String(formValue.longitude || '').trim();
    
    // Check for all zero variations (0, 0000, 00000, etc.)
    if (!latStr || latStr === '' || latStr === '0' || latStr === '0000' || latStr === '00000' || /^0+$/.test(latStr)) {
      Swal.fire("Validation Error!", "Please enter a valid Latitude (cannot be 0 or empty)", "error");
      this.dropForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.dropForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (!lngStr || lngStr === '' || lngStr === '0' || lngStr === '0000' || lngStr === '00000' || /^0+$/.test(lngStr)) {
      Swal.fire("Validation Error!", "Please enter a valid Longitude (cannot be 0 or empty)", "error");
      this.dropForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.dropForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Validate latitude and longitude ranges
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    
    if (isNaN(lat) || lat < -90 || lat > 90 || lat === 0 || Math.abs(lat) < 0.0001) {
      Swal.fire("Validation Error!", "Latitude must be between -90 and 90 (cannot be 0)", "error");
      this.dropForm.get('latitude')?.setErrors({ invalidLatitude: true });
      this.dropForm.get('latitude')?.markAsTouched();
      return;
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180 || lng === 0 || Math.abs(lng) < 0.0001) {
      Swal.fire("Validation Error!", "Longitude must be between -180 and 180 (cannot be 0)", "error");
      this.dropForm.get('longitude')?.setErrors({ invalidLongitude: true });
      this.dropForm.get('longitude')?.markAsTouched();
      return;
    }
    
    // Check form validity AFTER all custom validations
    if (!this.dropForm?.valid) {
      const errors = [];
      if (this.f['drop_name']?.errors) errors.push('Drop Name');
      if (this.f['drop_description']?.errors) errors.push('Drop Description');
      if (this.f['activity_id']?.errors) errors.push('Activity');
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
      return; // Don't proceed if form is invalid
    }
    
    // All validations passed, submit the form
    this._sendSaveRequest(this.dropForm.value);
  }

  _sendSaveRequest(formData: any) {
    const fD = new FormData();
    fD.append('drop_name', formData?.drop_name);
    fD.append('drop_description', formData?.drop_description);
    fD.append('latitude', formData?.latitude);
    fD.append('longitude', formData?.longitude);
    fD.append('activity_id', formData?.activity_id);

    if (this.dropImage) {
      fD.append('drop_image', this.dropImage!, this.dropImage?.name);
    }

    this.sp.show();
    this.api.postImageData('activity-drop/create', fD)
      .then((response: any) => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast("Activity Drop Created Successfully");
        }, 1000);
        setTimeout(() => {
          this.router.navigate(['partner/list-activity-drops']);
        }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        console.error('Create activity drop error:', error);
        Swal.fire("Activity Drop!", "There is an error, please try again", "error");
      });
  }
}
