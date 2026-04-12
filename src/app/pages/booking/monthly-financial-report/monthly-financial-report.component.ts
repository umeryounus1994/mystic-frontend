import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-monthly-financial-report',
  templateUrl: './monthly-financial-report.component.html',
  styleUrl: './monthly-financial-report.component.scss'
})
export class MonthlyFinancialReportComponent implements OnInit {
  partners: { id: string; label: string }[] = [];
  selectedPartnerId = '';
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  generating = false;

  readonly monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    labelKey: `BOOKING_REPORT.MONTH_${i + 1}`
  }));

  constructor(
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService,
    public auth: AuthService,
    private router: Router,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin && !this.auth.isSubAdmin) {
      this.router.navigate(['/dashboard/admin']);
      return;
    }
    this.loadPartners();
  }

  loadPartners(): void {
    this.sp.show();
    this.api
      .get('booking/admin/partners')
      .then((response: any) => {
        const rows = Array.isArray(response?.data) ? response.data : [];
        const list = this.mapPartnersFromRows(rows);
        if (list.length > 0) {
          this.sp.hide();
          this.partners = list;
          return;
        }
        this.loadPartnersFromAllAdmin();
      })
      .catch(() => {
        this.loadPartnersFromAllAdmin();
      });
  }

  private loadPartnersFromAllAdmin(): void {
    this.api
      .get('user/get_all_admin')
      .then((response: any) => {
        this.sp.hide();
        const rows = Array.isArray(response?.data) ? response.data : [];
        this.partners = this.mapPartnersFromRows(rows);
      })
      .catch(() => {
        this.sp.hide();
        this.helper.failureToast(this.translate.instant('BOOKING_REPORT.LOAD_PARTNERS_FAILED'));
      });
  }

  /** Supports full user rows and slim admin partner rows (type + business_name at root). */
  private mapPartnersFromRows(rows: any[]): { id: string; label: string }[] {
    const list: { id: string; label: string }[] = [];
    for (const u of rows) {
      if (!this.isPartnerUser(u)) {
        continue;
      }
      const id = this.getPartnerRowId(u);
      if (!id) {
        continue;
      }
      list.push({ id, label: this.partnerLabel(u) });
    }
    list.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
    return list;
  }

  private getPartnerRowId(u: any): string {
    const raw = u?._id ?? u?.id ?? u?.user_id;
    return raw != null ? String(raw) : '';
  }

  private isPartnerUser(u: any): boolean {
    const t = (u?.user_type ?? u?.type ?? u?.role ?? '').toString().toLowerCase();
    return t === 'partner';
  }

  /** Prefer business name for the monthly report dropdown; then username / person / email / id. */
  private partnerLabel(u: any): string {
    const rootBn = u?.business_name?.toString().trim();
    if (rootBn) {
      return rootBn;
    }
    const nestedBn = u?.partner_profile?.business_name?.toString().trim();
    if (nestedBn) {
      return nestedBn;
    }
    const un = u?.username?.toString().trim();
    if (un) {
      return un;
    }
    const fn = (u?.first_name ?? '').toString().trim();
    const ln = (u?.last_name ?? '').toString().trim();
    const name = `${fn} ${ln}`.trim();
    if (name) {
      return name;
    }
    const em = u?.email?.toString().trim();
    if (em) {
      return em;
    }
    return this.getPartnerRowId(u) || '—';
  }

  async generatePdf(): Promise<void> {
    if (!this.selectedPartnerId) {
      this.helper.warningToast(this.translate.instant('BOOKING_REPORT.SELECT_PARTNER'));
      return;
    }
    const y = Number(this.year);
    const m = Number(this.month);
    if (!Number.isFinite(y) || y < 2000 || y > 2100) {
      this.helper.warningToast(this.translate.instant('BOOKING_REPORT.INVALID_YEAR'));
      return;
    }
    if (!Number.isFinite(m) || m < 1 || m > 12) {
      this.helper.warningToast(this.translate.instant('BOOKING_REPORT.INVALID_MONTH'));
      return;
    }

    const path = `booking/admin/partner/${this.selectedPartnerId}/monthly-financial-report/pdf?year=${y}&month=${m}`;
    this.generating = true;
    this.sp.show();
    try {
      const blob = await this.api.getBlob(path);
      if (blob.type && blob.type.includes('application/json')) {
        const text = await blob.text();
        let msg = this.translate.instant('BOOKING_REPORT.PDF_FAILED');
        try {
          const j = JSON.parse(text);
          msg = j?.message || j?.error || msg;
        } catch {
          /* keep default */
        }
        this.helper.failureToast(msg);
        return;
      }
      const filename = `monthly-financial-report-${this.selectedPartnerId}-${y}-${String(m).padStart(2, '0')}.pdf`;
      this.triggerDownload(blob, filename);
      this.helper.successToast(this.translate.instant('BOOKING_REPORT.PDF_READY'));
    } catch (e: any) {
      const errBody = e?.error;
      if (errBody instanceof Blob) {
        try {
          const t = await errBody.text();
          const j = JSON.parse(t);
          this.helper.failureToast(j?.message || this.translate.instant('BOOKING_REPORT.PDF_FAILED'));
        } catch {
          this.helper.failureToast(this.translate.instant('BOOKING_REPORT.PDF_FAILED'));
        }
      } else {
        this.helper.failureToast(e?.message || this.translate.instant('BOOKING_REPORT.PDF_FAILED'));
      }
    } finally {
      this.generating = false;
      this.sp.hide();
    }
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  yearOptions(): number[] {
    const cy = new Date().getFullYear();
    const out: number[] = [];
    for (let y = cy + 1; y >= cy - 5; y--) {
      out.push(y);
    }
    return out;
  }
}
