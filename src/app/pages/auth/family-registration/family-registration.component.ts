import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { signupPasswordValidator } from '../signup-password.validator';

@Component({
  selector: 'app-family-registration',
  templateUrl: './family-registration.component.html',
  styleUrl: './family-registration.component.scss'
})
export class FamilyRegistrationComponent implements OnInit {
  familyForm!: FormGroup;
  isSubmitting = false;
  fieldTextType = false;
  fieldTextTypeConfirm = false;
  text = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private helper: HelperService,
    private sp: NgxSpinnerService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.familyForm = this.fb.group({
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
    const field = this.familyForm?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getValidationMessage(key: string): string {
    return this.translate.instant(key);
  }

  onSubmit() {
    if (!this.familyForm?.valid) {
      this.markFormGroupTouched();
      Swal.fire(this.translate.instant('AUTH.REGISTRATION'), this.translate.instant('POPUPS.FILL_ALL_REQUIRED_FIELDS'), 'error');
      return;
    }
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.text = 'AUTH.CREATING_ACCOUNT';
    this.sp.show();

    const v = this.familyForm.value;
    this.auth.registerFamily({
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
        if (error?.status === 409) {
          this.helper.failureToast(this.translate.instant('POPUPS.ACCOUNT_EXISTS_MESSAGE'));
        } else if (error?.status === 400) {
          this.helper.failureToast(errorMessage);
        } else {
          Swal.fire(this.translate.instant('MESSAGES.REGISTRATION_FAILED'), errorMessage, 'error');
        }
      }
    });
  }

  private markFormGroupTouched() {
    if (!this.familyForm) return;
    Object.keys(this.familyForm.controls).forEach(key => {
      this.familyForm!.get(key)?.markAsTouched();
    });
  }

  showPassword() {
    this.fieldTextType = !this.fieldTextType;
  }

  showPasswordConfirm() {
    this.fieldTextTypeConfirm = !this.fieldTextTypeConfirm;
  }
}
