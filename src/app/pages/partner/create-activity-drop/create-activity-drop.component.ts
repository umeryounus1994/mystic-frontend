import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  ngOnInit() {
    this.dropForm = this.fb.group({
      drop_name: ['', [Validators.required, Validators.minLength(3)]],
      drop_description: ['', [Validators.required, Validators.minLength(10)]],
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
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
    if (this.dropForm?.valid) {
      this._sendSaveRequest(this.dropForm.value);
    } else {
      this.helper.failureToast('Please fill all required fields');
    }
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
