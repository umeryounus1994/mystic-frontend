import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { TranslateService } from '@ngx-translate/core';
declare var $: any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isSubmitted = false;
  submissionForm: FormGroup | any;
  fieldTextType: boolean = false;
  text = "";

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private auth: AuthService, 
    private sp: NgxSpinnerService,
    private helper: HelperService, 
    private api: RestApiService,
    public translate: TranslateService
  ) {
  }


  ngOnInit() {
    // Always hide spinner when login component loads (especially after session expiry)
    this.sp.hide();
    this.isSubmitted = false;
    
    // Check for remembered credentials
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    
    this.submissionForm = this.fb.group({
      email: [rememberedEmail || '', Validators.required],
      password: [rememberedPassword || '', Validators.required],
      rememberMe: [!!rememberedEmail]
    });
  }

  onSubmit() {
    if (this.submissionForm.valid) {
      this.isSubmitted = true;
      this.text = 'AUTH.LOGGING_IN';
      this.sp.show()
      
      // Handle remember me
      const rememberMe = this.submissionForm.get('rememberMe')?.value;
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', this.submissionForm.value.email);
        localStorage.setItem('rememberedPassword', this.submissionForm.value.password);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }
      
      this.auth.login(this.submissionForm.value).then((data: any) => {
        this.isSubmitted = false;
        this.sp.hide();
        if (data === 'open') {
          if (this.auth.isAdmin === true) {
            this.router.navigateByUrl('dashboard/admin');
          }
          if (this.auth.isSubAdmin === true) {
            this.router.navigateByUrl('quest/list-quest');
          }
          if (this.auth.isFamily === true) {
            this.router.navigateByUrl('dashboard/family');
          }
          if (this.auth.isPartner === true) {
            this.router.navigateByUrl('dashboard/partner');
          }
        }
      }).catch((error: any) => {
        this.isSubmitted = false;
        this.sp.hide();
        if(error.status === 400) {
          this.helper.failureToast(error?.error.message)
        }
        if(error.status === 404) {
          this.helper.failureToast(error?.error.message)
        }
      });
    } else {
      this.translate.get(['MESSAGES.ERROR', 'AUTH.EMAIL_PASSWORD_REQUIRED']).subscribe((res: any) => {
        Swal.fire(res['MESSAGES.ERROR'], res['AUTH.EMAIL_PASSWORD_REQUIRED'], "error");
      });
    }
  }
  showPassword(){
    this.fieldTextType = !this.fieldTextType;
  }
  resetPassword(){
    if($("#forgotemail").val() == "" || $("#forgotemail").val() == undefined){
      this.translate.get(['AUTH.EMAIL_REQUIRED', 'VALIDATION.REQUIRED']).subscribe((res: any) => {
        Swal.fire(res['AUTH.EMAIL_REQUIRED'], res['VALIDATION.REQUIRED'], "error");
      });
      return;
    }
    this.text = 'AUTH.SENDING_RESET_LINK';
    this.sp.show();
    let data = {
      "email": $("#forgotemail").val()
    };
    this.api.post('admin/send-reset-password-email', data)
      .then((response: any) => {
          this.sp.hide();
          Swal.fire("Reset Password!", response?.message, "info");
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Reset Password!", error?.message, "error");
      });
  }
  showResetPasswordModal(){
    $("#forgetPassword").modal('show')
    $('.modal-backdrop').removeClass('modal-backdrop').addClass('modal');
  }
}
