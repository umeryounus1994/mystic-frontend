import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { PartnerRegistrationRequest } from '../../../models/PartnerRegistrationRequest.model';
import Swal from 'sweetalert2';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, from } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-partner-registration',
  templateUrl: './partner-registration.component.html',
  styleUrls: ['./partner-registration.component.scss']
})
export class PartnerRegistrationComponent implements OnInit {
  partnerForm!: FormGroup;
  isSubmitting = false;
  selectedImage: File | null = null;
  selectedDocuments: File[] = [];
  fieldTextType: boolean = false;
  fieldTextTypeConfirm: boolean = false;
  text = "";

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
    this.partnerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100), this.validateEmailFormat]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15), this.validatePassword]],
      confirm_password: ['', Validators.required],
      user_type: ['partner'],
      partner_profile: this.fb.group({
        business_name: ['', [Validators.required, Validators.maxLength(100)]],
        business_description: ['', [Validators.required, Validators.maxLength(500)]],
        phone: ['', [Validators.required, Validators.maxLength(20)]],
        routing_number: ['', [Validators.required, Validators.maxLength(20)]],
        commission_rate: [15],
        bank_details: this.fb.group({
          account_number: ['', [Validators.required, Validators.maxLength(50)]],
          account_holder: ['', [Validators.required, Validators.maxLength(100)]]
        }),
        approval_status: ['pending']
      }),
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  validateEmailFormat(control: any) {
    if (!control.value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(control.value)) {
      return { invalidEmail: true };
    }
    // Additional check for proper domain
    const parts = control.value.split('@');
    if (parts.length !== 2 || parts[1].split('.').length < 2) {
      return { invalidEmail: true };
    }
    return null;
  }

  validatePassword(control: any) {
    if (!control.value) return null;
    const password = control.value;
    // Password must be: alphanumeric + special chars, max 10 chars, 1 capital, 1 number
    if (password.length > 15) {
      return { maxLength: true };
    }
    if (!/[A-Z]/.test(password)) {
      return { noCapital: true };
    }
    if (!/[0-9]/.test(password)) {
      return { noNumber: true };
    }
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(password)) {
      return { invalidChars: true };
    }
    return null;
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

  isPartnerFieldInvalid(fieldName: string): boolean {
    const field = this.partnerForm?.get(`partner_profile.${fieldName}`);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isBankFieldInvalid(fieldName: string): boolean {
    const field = this.partnerForm?.get(`partner_profile.bank_details.${fieldName}`);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Translation getters for validation messages
  getValidationMessage(key: string): string {
    return this.translate.instant(key);
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  onDocumentsSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedDocuments = files;
  }

  onSubmit() {
    // Mark all fields as touched to show validation errors
    if (!this.partnerForm?.valid) {
      this.markFormGroupTouched();
      Swal.fire("Registration", "Please fill all required fields correctly", "error");
      return;
    }

    // Additional validation checks before submission
    if (!this.validateFormData()) {
      return;
    }

    // Prevent double submission
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.text = "Registering partner...";
    this.sp.show();
    
    const formData = this.prepareFormData();
    
    // Add timeout handling
    const timeoutId = setTimeout(() => {
      if (this.isSubmitting) {
        this.sp.hide();
        this.isSubmitting = false;
        Swal.fire("Registration Timeout", "The registration request took too long. Please try again.", "error");
      }
    }, 30000); // 30 second timeout
    
    this.auth.registerPartner(formData).subscribe({
      next: (response) => {
        clearTimeout(timeoutId);
        this.sp.hide();
        this.isSubmitting = false;
        console.log('Partner registration successful', response);
        
        setTimeout(() => {
          this.helper.successToast("Partner registration successful! Please wait for approval.");
        }, 1000);
        
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        clearTimeout(timeoutId);
        this.sp.hide();
        this.isSubmitting = false;
        console.error('Registration failed', error);
        
        // More comprehensive error handling
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Handle specific error cases
        if (error?.status === 0 || error?.status === undefined) {
          // Network error or timeout
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('POPUPS.CONNECTION_ERROR'),
            text: this.translate.instant('POPUPS.CONNECTION_ERROR_MESSAGE'),
            confirmButtonText: this.translate.instant('COMMON.OK')
          });
        } else if (error?.status === 400) {
          // Bad request - validation errors
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('MESSAGES.VALIDATION_ERROR'),
            text: errorMessage || this.translate.instant('POPUPS.CHECK_REQUIRED_FIELDS'),
            confirmButtonText: this.translate.instant('COMMON.OK')
          });
        } else if (error?.status === 409) {
          // Conflict - duplicate email/username
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('POPUPS.ACCOUNT_EXISTS'),
            text: this.translate.instant('POPUPS.ACCOUNT_EXISTS_MESSAGE'),
            confirmButtonText: this.translate.instant('COMMON.OK')
          });
        } else if (error?.status === 500) {
          // Server error
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('POPUPS.SERVER_ERROR'),
            text: errorMessage || this.translate.instant('POPUPS.SERVER_ERROR_MESSAGE'),
            confirmButtonText: this.translate.instant('COMMON.OK')
          });
        } else {
          // Generic error
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

  private validateFormData(): boolean {
    // Validate image file if provided
    if (this.selectedImage) {
      // Check file size (max 5MB)
      if (this.selectedImage.size > 5 * 1024 * 1024) {
        Swal.fire("Validation Error", "Profile image size must be less than 5MB", "error");
        return false;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(this.selectedImage.type)) {
        Swal.fire("Validation Error", "Profile image must be a JPEG, PNG, or GIF file", "error");
        return false;
      }
    }

    // Validate all required fields are not empty strings
    const formValue = this.partnerForm.value;
    
    if (!formValue.username || formValue.username.trim() === '') {
      Swal.fire("Validation Error", "Username is required", "error");
      return false;
    }
    
    if (!formValue.email || formValue.email.trim() === '') {
      Swal.fire("Validation Error", "Email is required", "error");
      return false;
    }
    
    if (!formValue.password || formValue.password.trim() === '') {
      Swal.fire("Validation Error", "Password is required", "error");
      return false;
    }
    
    if (!formValue.partner_profile?.business_name || formValue.partner_profile.business_name.trim() === '') {
      Swal.fire("Validation Error", "Business name is required", "error");
      return false;
    }
    
    if (!formValue.partner_profile?.phone || formValue.partner_profile.phone.trim() === '') {
      Swal.fire("Validation Error", "Phone number is required", "error");
      return false;
    }
    
    if (!formValue.partner_profile?.routing_number || formValue.partner_profile.routing_number.trim() === '') {
      Swal.fire("Validation Error", "Routing number is required", "error");
      return false;
    }
    
    if (!formValue.partner_profile?.bank_details?.account_number || formValue.partner_profile.bank_details.account_number.trim() === '') {
      Swal.fire("Validation Error", "Account number is required", "error");
      return false;
    }
    
    if (!formValue.partner_profile?.bank_details?.account_holder || formValue.partner_profile.bank_details.account_holder.trim() === '') {
      Swal.fire("Validation Error", "Account holder name is required", "error");
      return false;
    }

    return true;
  }

  private prepareFormData(): PartnerRegistrationRequest {
    const formValue = this.partnerForm?.value;
    
    const registrationData: PartnerRegistrationRequest = {
      username: formValue.username?.trim(),
      email: formValue.email?.trim(),
      password: formValue.password,
      confirm_password: formValue.confirm_password,
      user_type: 'partner',
      partner_profile: {
        business_name: formValue.partner_profile.business_name?.trim(),
        business_description: formValue.partner_profile.business_description?.trim() || '',
        phone: formValue.partner_profile.phone?.trim(),
        commission_rate: formValue.partner_profile.commission_rate || 15,
        bank_details: {
          account_number: formValue.partner_profile.bank_details.account_number?.trim(),
          routing_number: formValue.partner_profile.routing_number?.trim(),
          account_holder: formValue.partner_profile.bank_details.account_holder?.trim()
        },
        approval_status: 'pending'
      }
    };

    if (this.selectedImage) {
      registrationData.image = this.selectedImage;
    }

    return registrationData;
  }

  private markFormGroupTouched() {
    if (this.partnerForm) {
      Object.keys(this.partnerForm.controls).forEach(key => {
        const control = this.partnerForm!.get(key);
        control?.markAsTouched();

        if (control instanceof FormGroup) {
          this.markNestedFormGroupTouched(control);
        }
      });
    }
  }

  private markNestedFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markNestedFormGroupTouched(control);
      }
    });
  }

  showPassword() {
    this.fieldTextType = !this.fieldTextType;
  }

  showPasswordConfirm() {
    this.fieldTextTypeConfirm = !this.fieldTextTypeConfirm;
  }
}
