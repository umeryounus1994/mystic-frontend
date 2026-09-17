import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-exploring-spot',
  templateUrl: './add-exploring-spot.component.html',
  styleUrl: './add-exploring-spot.component.scss'
})
export class AddExploringSpotComponent implements OnInit {
  spotForm: FormGroup | any;
  submitted = false;

  constructor(
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private helper: HelperService,
    public router: Router,
    private fb: FormBuilder,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.spotForm = this.fb.group({
      spot_name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      city: ['', Validators.required],
      latitude: ['', [Validators.required, this.validateLatitude.bind(this)]],
      longitude: ['', [Validators.required, this.validateLongitude.bind(this)]],
      radius_meters: [100, [Validators.required, Validators.min(10)]],
      no_of_points: [1, [Validators.required, Validators.min(1)]],
    });
  }

  get f() { return this.spotForm?.controls; }

  validateLatitude(control: AbstractControl): ValidationErrors | null {
    const lat = parseFloat(control.value);
    if (control.value === '' || control.value == null) return { required: true };
    if (isNaN(lat) || lat < -90 || lat > 90) return { invalidLatitude: true };
    return null;
  }

  validateLongitude(control: AbstractControl): ValidationErrors | null {
    const lng = parseFloat(control.value);
    if (control.value === '' || control.value == null) return { required: true };
    if (isNaN(lng) || lng < -180 || lng > 180) return { invalidLongitude: true };
    return null;
  }

  onSubmit() {
    this.submitted = true;
    if (!this.spotForm?.valid) {
      Swal.fire(this.translate.instant('VALIDATION.VALIDATION_ERROR'), this.translate.instant('VALIDATION.PLEASE_FIX_ERRORS'), "error");
      return;
    }
    this.sp.show();
    this.api.post('exploringSpot/create', this.spotForm.value)
      .then(() => {
        this.sp.hide();
        this.helper.successToast(this.translate.instant('EXPLORING_SPOTS.CREATED_SUCCESSFULLY'));
        this.router.navigate(['management/list-exploring-spots']);
      })
      .catch(() => {
        this.sp.hide();
        Swal.fire(this.translate.instant('EXPLORING_SPOTS.TITLE'), this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }
}
