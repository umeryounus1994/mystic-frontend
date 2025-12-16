import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  isSubmitted = false;
  submissionForm: FormGroup | any;
  fieldTextType: boolean = false;
  fieldTextTypeOld: boolean = false;
  id: any;
  linkExpired = true;
  resetId: any;
  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute, 
    private sp: NgxSpinnerService,
    private helper: HelperService, 
    private api: RestApiService,
    public translate: TranslateService
  ) {
  }


  ngOnInit() {
    this.submissionForm = this.fb.group({
      old_passwrd: ['', Validators.required],
      new_password: ['', Validators.required]
    });
    this.id = this.route.snapshot.queryParamMap.get('id');

    this.api.get('admin/reset-password-request-details/'+ this.id)
    .then((response: any) => {
        this.sp.hide();
        this.resetId = response?.data?.user_id;
        this.linkExpired = false;
    }).catch((error: any) => {
      this.sp.hide();
      Swal.fire(this.translate.instant('AUTH.RESET_PASSWORD'), error?.error?.message, "error");
    });
  }

  onSubmit() {
    if (this.submissionForm.valid) {
      this.isSubmitted = true;
      this.sp.show()
      let data = {
        "password": this.submissionForm.value.old_passwrd,
        "password_confirmation": this.submissionForm.value.new_password,
        "id": this.resetId
      };
      console.log(data)
      this.api.post('admin/change-password', data)
        .then((response: any) => {
            this.sp.hide();
            Swal.fire(this.translate.instant('AUTH.RESET_PASSWORD'), response?.message, "info");
            setTimeout(() => {
              this.router.navigate(['auth/login']);
            }, 2000);
        })
        .catch((error) => {
          this.sp.hide();
          Swal.fire(this.translate.instant('AUTH.RESET_PASSWORD'), error?.error?.message, "error");
        });
    }
  }
  showPassword(){
    this.fieldTextType = !this.fieldTextType;
  }
  showPasswordOld(){
    this.fieldTextTypeOld = !this.fieldTextTypeOld;
  }
}
