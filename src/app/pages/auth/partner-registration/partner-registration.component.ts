import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { signupPasswordValidator } from '../signup-password.validator';

@Component({
  selector: 'app-partner-registration',
  templateUrl: './partner-registration.component.html',
  styleUrls: ['./partner-registration.component.scss']
})
export class PartnerRegistrationComponent implements OnInit {
  partnerForm!: FormGroup;
  isSubmitting = false;
  fieldTextType = false;
  fieldTextTypeConfirm = false;
  text = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private sp: NgxSpinnerService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.partnerForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      password: ['', [Validators.required, signupPasswordValidator]],
      confirm_password: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirm_password');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.partnerForm?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getValidationMessage(key: string): string {
    return this.translate.instant(key);
  }

  onSubmit() {
    if (!this.partnerForm?.valid) {
      this.markFormGroupTouched();
      Swal.fire(
        this.translate.instant('AUTH.REGISTRATION'),
        this.translate.instant('POPUPS.FILL_ALL_REQUIRED_FIELDS'),
        'error'
      );
      return;
    }
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.text = 'AUTH.REGISTERING';
    this.sp.show();

    const v = this.partnerForm.value;
    this.auth.registerPartner({
      first_name: v.first_name,
      last_name: v.last_name,
      email: v.email,
      password: v.password
    }).subscribe({
      next: () => {
        this.sp.hide();
        this.isSubmitting = false;
        this.router.navigate(['/auth/confirm-email'], { queryParams: { email: (v.email || '').trim() } });
      },
      error: (error) => {
        this.sp.hide();
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || this.translate.instant('MESSAGES.REGISTRATION_FAILED');
        if (error?.status === 0 || error?.status === undefined) {
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('POPUPS.CONNECTION_ERROR'),
            text: this.translate.instant('POPUPS.CONNECTION_ERROR_MESSAGE'),
            confirmButtonText: this.translate.instant('COMMON.OK')
          });
        } else if (error?.status === 409) {
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('POPUPS.ACCOUNT_EXISTS'),
            text: this.translate.instant('POPUPS.ACCOUNT_EXISTS_MESSAGE'),
            confirmButtonText: this.translate.instant('COMMON.OK')
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('MESSAGES.REGISTRATION_FAILED'),
            text: errorMessage,
            confirmButtonText: this.translate.instant('COMMON.OK')
          });
        }
      }
    });
  }

  private markFormGroupTouched() {
    if (!this.partnerForm) return;
    Object.keys(this.partnerForm.controls).forEach(key => {
      this.partnerForm!.get(key)?.markAsTouched();
    });
  }

  showPassword() {
    this.fieldTextType = !this.fieldTextType;
  }

  showPasswordConfirm() {
    this.fieldTextTypeConfirm = !this.fieldTextTypeConfirm;
  }
}
