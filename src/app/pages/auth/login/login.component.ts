import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
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
          const returnUrl = this.route.snapshot.queryParams['returnUrl'];
          if (returnUrl && this.isSafeInternalPath(returnUrl)) {
            this.router.navigateByUrl(returnUrl);
            return;
          }
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
        const msg = (error?.error?.message || '') as string;
        const status = error?.status;

        if (status === 401 || status === 403) {
          if (this.isEmailVerificationRequired(msg)) {
            const email = (this.submissionForm.value?.email || '').trim();
            Swal.fire({
              icon: 'warning',
              title: this.translate.instant('AUTH.VERIFY_EMAIL_LOGIN_TITLE'),
              html: `${this.translate.instant('AUTH.VERIFY_EMAIL_LOGIN_BODY')}<br><br><small>${this.escapeHtml(msg)}</small>`,
              showCancelButton: true,
              confirmButtonText: this.translate.instant('AUTH.RESEND_VERIFICATION'),
              cancelButtonText: this.translate.instant('COMMON.CLOSE')
            }).then((result) => {
              if (result.isConfirmed && email) {
                this.auth.resendVerificationEmail(email).then((res: any) => {
                  this.helper.successToast(res?.message || this.translate.instant('AUTH.RESEND_SUCCESS_GENERIC'));
                }).catch(() => {
                  this.helper.successToast(this.translate.instant('AUTH.RESEND_SUCCESS_GENERIC'));
                });
              }
            });
            return;
          }
        }

        if (status === 400) {
          this.helper.failureToast(error?.error?.message);
        } else if (status === 404) {
          this.helper.failureToast(error?.error?.message);
        } else if (status === 401 || status === 403) {
          this.helper.failureToast(msg || this.translate.instant('MESSAGES.INVALID_CREDENTIALS'));
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
        Swal.fire("Reset Password!", error?.error?.message, "error");
      });
  }
  showResetPasswordModal(){
    $("#forgetPassword").modal('show')
    $('.modal-backdrop').removeClass('modal-backdrop').addClass('modal');
  }

  private isEmailVerificationRequired(message: string): boolean {
    if (!message || typeof message !== 'string') return false;
    const m = message.toLowerCase();
    if (m.includes('email not verified') || m.includes('not verified') || m.includes('unverified')) return true;
    return m.includes('verify') && (m.includes('email') || m.includes('e-mail') || m.includes('inbox'));
  }

  private escapeHtml(s: string): string {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Only allow internal paths to prevent open redirect. */
  private isSafeInternalPath(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.toLowerCase().startsWith('http');
  }
}
