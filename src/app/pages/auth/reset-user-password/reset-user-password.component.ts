import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
declare var $: any;
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-user-password',
  templateUrl: './reset-user-password.component.html',
  styleUrl: './reset-user-password.component.scss'
})
export class ResetUserPasswordComponent implements OnInit {
  isSubmitted = false;
  submissionForm: FormGroup | any;
  fieldTextType: boolean = false;
  fieldTextTypeOld: boolean = false;
  id: any;
  linkExpired = true;
  resetId: any;
  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private sp: NgxSpinnerService,
    private helper: HelperService, private api: RestApiService) {
  }


  ngOnInit() {
    this.submissionForm = this.fb.group({
      password: ['', Validators.required]
    });
    this.id = this.route.snapshot.queryParamMap.get('id');

    this.api.get('user/reset-password-request-details/'+ this.id)
    .then((response: any) => {
        this.sp.hide();
        this.resetId = response?.data?._id;
        this.linkExpired = false;
    }).catch((error: any) => {
      this.sp.hide();
      Swal.fire("Reset Password!", error?.error?.message, "error");
    });
  }

  onSubmit() {
    console.log(this.resetId)
    if (this.submissionForm.valid) {
      this.isSubmitted = true;
      this.sp.show()
      let data = {
        "password": this.submissionForm.value.password,
        "request_id": this.resetId
      };
      this.api.post('user/change-password', data)
        .then((response: any) => {
            this.sp.hide();
            Swal.fire("Reset Password!", response?.message, "info");
            this.submissionForm.value.password = "";
            // setTimeout(() => {
            //   this.router.navigate(['auth/login']);
            // }, 2000);
        })
        .catch((error) => {
          this.sp.hide();
          Swal.fire("Reset Password!", error?.error?.message, "error");
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
