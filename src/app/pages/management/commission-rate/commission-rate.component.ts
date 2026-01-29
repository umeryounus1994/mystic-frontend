import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { CommissionRateService } from '../../../services/commission-rate/commission-rate.service';

@Component({
  selector: 'app-commission-rate',
  templateUrl: './commission-rate.component.html',
  styleUrls: ['./commission-rate.component.scss']
})
export class CommissionRateComponent implements OnInit {
  form!: FormGroup;
  currentRate: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private commissionRateService: CommissionRateService,
    private helper: HelperService,
    private spinner: NgxSpinnerService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Allow admin, or subadmin with Commission Rate / All permission (PermissionGuard also enforces this)
    const perms = this.auth.user?.permissions || [];
    const canAccess = this.auth.isAdmin || perms.includes('All') || perms.includes('Commission Rate');
    if (!canAccess) {
      this.helper.failureToast('Unauthorized');
      this.router.navigateByUrl('/dashboard/admin');
      return;
    }

    this.form = this.fb.group({
      rate: [
        null,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100),
          Validators.pattern(/^\d+(\.\d+)?$/)
        ]
      ]
    });

    this.loadCurrentRate();
  }

  get rateCtrl() {
    return this.form.get('rate');
  }

  async loadCurrentRate(): Promise<void> {
    this.loading = true;
    this.spinner.show();
    try {
      const res: any = await this.commissionRateService.getCommissionRate();
      const rate = this.extractRate(res);
      this.currentRate = rate;
      if (typeof rate === 'number' && !Number.isNaN(rate)) {
        this.form.patchValue({ rate });
      }
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to load commission rate');
    } finally {
      this.loading = false;
      this.spinner.hide();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.form) return;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.helper.warningToast('Please enter a valid rate between 0 and 100');
      return;
    }

    const raw = this.rateCtrl?.value;
    const rate = typeof raw === 'number' ? raw : parseFloat(String(raw));
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      this.helper.warningToast('Please enter a valid rate between 0 and 100');
      return;
    }

    this.spinner.show();
    try {
      const res: any = await this.commissionRateService.updateCommissionRate(rate);
      const updated = this.extractRate(res) ?? rate;
      this.currentRate = updated;
      this.form.patchValue({ rate: updated });
      this.helper.successToast(res?.message || 'Commission rate updated');
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to update commission rate');
    } finally {
      this.spinner.hide();
    }
  }

  private extractRate(res: any): number | null {
    const candidates = [
      res?.data?.rate,
      res?.rate,
      res?.data?.commission_rate,
      res?.commission_rate
    ];
    for (const c of candidates) {
      const n = typeof c === 'number' ? c : parseFloat(String(c));
      if (!Number.isNaN(n) && Number.isFinite(n)) return n;
    }
    return null;
  }
}

