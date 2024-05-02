import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isSubmitted = false;
  submissionForm: FormGroup | any;

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService, private sp: NgxSpinnerService,
    private helper: HelperService) {
  }


  ngOnInit() {
    this.submissionForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.submissionForm.valid) {
      this.isSubmitted = true;
      this.sp.show()
      this.auth.login(this.submissionForm.value).then((data: any) => {
        this.isSubmitted = false;
        this.sp.hide();
        if (data === 'open') {
          if (this.auth.isAdmin === true) {
            this.router.navigateByUrl('dashboard/admin');
          }
        }
      }).catch((error: any) => {
        if(error.status === 400) {
          this.sp.hide()
          this.helper.failureToast(error?.error.message)
        }
      });
    }
  }
}
