import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss'
})
export class ConfirmEmailComponent implements OnInit {
  email = '';
  resendLoading = false;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private helper: HelperService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
  }

  resend() {
    const e = (this.email || '').trim();
    if (!e) {
      this.helper.failureToast(this.translate.instant('AUTH.RESEND_ENTER_EMAIL'));
      return;
    }
    this.resendLoading = true;
    this.auth.resendVerificationEmail(e).then((res: any) => {
      this.resendLoading = false;
      this.helper.successToast(res?.message || this.translate.instant('AUTH.RESEND_SUCCESS_GENERIC'));
    }).catch(() => {
      this.resendLoading = false;
      this.helper.successToast(this.translate.instant('AUTH.RESEND_SUCCESS_GENERIC'));
    });
  }
}
