import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-family-registration',
  templateUrl: './family-registration.component.html',
  styleUrl: './family-registration.component.scss'
})
export class FamilyRegistrationComponent implements OnInit {
  familyForm!: FormGroup;
  isSubmitting = false;
  selectedImage: File | null = null;
  fieldTextType: boolean = false;
  fieldTextTypeConfirm: boolean = false;
  text = "";

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router, 
    private helper: HelperService,
    private sp: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.familyForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100), this.validateEmailFormat]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10), this.validatePassword]],
      confirm_password: ['', Validators.required],
      user_type: ['family'],
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
    if (password.length > 10) {
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
    const field = this.familyForm?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }

  onSubmit() {
    if (this.familyForm?.valid) {
      this.isSubmitting = true;
      this.text = "Registering family...";
      this.sp.show();
      
      const formData = this.prepareFormData();
      
      this.auth.registerFamily(formData).subscribe({
        next: (response) => {
          this.sp.hide();
          this.isSubmitting = false;
          console.log('Family registration successful', response);
          
          setTimeout(() => {
            this.helper.successToast("Family registration successful!");
          }, 1000);
          
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.sp.hide();
          this.isSubmitting = false;
          console.error('Registration failed', error);
          
          if (error?.status === 400) {
            this.helper.failureToast(error?.error?.message || 'Registration failed. Please check your details.');
          } else if (error?.status === 409) {
            this.helper.failureToast('Email or username already exists.');
          } else {
            Swal.fire("Registration Failed!", error?.error?.message, "error");
          }
        }
      });
    } else {
      this.markFormGroupTouched();
      Swal.fire("Registration", "Please fill all required fields correctly", "error");
    }
  }

  private prepareFormData(): any {
    const formValue = this.familyForm?.value;
    
    const registrationData: any = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      confirm_password: formValue.confirm_password,
      user_type: 'family'
    };

    if (this.selectedImage) {
      registrationData.image = this.selectedImage;
    }

    return registrationData;
  }

  private markFormGroupTouched() {
    if (this.familyForm) {
      Object.keys(this.familyForm.controls).forEach(key => {
        const control = this.familyForm!.get(key);
        control?.markAsTouched();
      });
    }
  }

  showPassword() {
    this.fieldTextType = !this.fieldTextType;
  }

  showPasswordConfirm() {
    this.fieldTextTypeConfirm = !this.fieldTextTypeConfirm;
  }
}
