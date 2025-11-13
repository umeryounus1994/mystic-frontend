import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { PartnerRegistrationRequest } from '../../../models/PartnerRegistrationRequest.model';
import Swal from 'sweetalert2';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private sp: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.partnerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required],
      user_type: ['partner'],
      partner_profile: this.fb.group({
        business_name: ['', Validators.required],
        business_description: ['', Validators.required],
        phone: ['', Validators.required],
        routing_number: ['', Validators.required],
        commission_rate: [15],
        bank_details: this.fb.group({
          account_number: ['', Validators.required],
          account_holder: ['', Validators.required]
        }),
        approval_status: ['pending']
      }),
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

  isPartnerFieldInvalid(fieldName: string): boolean {
    const field = this.partnerForm?.get(`partner_profile.${fieldName}`);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isBankFieldInvalid(fieldName: string): boolean {
    const field = this.partnerForm?.get(`partner_profile.bank_details.${fieldName}`);
    return !!(field && field.invalid && (field.dirty || field.touched));
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
    if (this.partnerForm?.valid) {
      this.isSubmitting = true;
      this.text = "Registering partner...";
      this.sp.show();
      
      const formData = this.prepareFormData();
      
      this.auth.registerPartner(formData).subscribe({
        next: (response) => {
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

  private prepareFormData(): PartnerRegistrationRequest {
    const formValue = this.partnerForm?.value;
    
    const registrationData: PartnerRegistrationRequest = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      confirm_password: formValue.confirm_password,
      user_type: 'partner',
      partner_profile: {
        business_name: formValue.partner_profile.business_name,
        business_description: formValue.partner_profile.business_description,
        phone: formValue.partner_profile.phone,
        commission_rate: formValue.partner_profile.commission_rate,
        bank_details: formValue.partner_profile.bank_details,
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
