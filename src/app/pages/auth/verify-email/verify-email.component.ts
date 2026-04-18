import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token || !token.trim()) {
      this.status = 'error';
      this.message = this.translate.instant('AUTH.VERIFY_EMAIL_INVALID_LINK');
      return;
    }
    this.auth.verifyEmailToken(token.trim()).then((res: any) => {
      this.status = 'success';
      this.message = res?.message || this.translate.instant('AUTH.VERIFY_EMAIL_SUCCESS');
    }).catch((err: any) => {
      this.status = 'error';
      this.message = err?.error?.message || this.translate.instant('AUTH.VERIFY_EMAIL_FAILED');
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
