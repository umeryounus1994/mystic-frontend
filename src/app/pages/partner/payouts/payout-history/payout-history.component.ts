import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PayoutService } from '../../../../services/payout/payout.service';
import { HelperService } from '../../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';
declare var $: any;

@Component({
  selector: 'app-payout-history',
  templateUrl: './payout-history.component.html',
  styleUrl: './payout-history.component.scss'
})
export class PayoutHistoryComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };

  payouts: any = [];
  pagination: any = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  };
  selectedStatusFilter = '';

  constructor(
    private sp: NgxSpinnerService,
    private payoutService: PayoutService,
    private helper: HelperService,
    public translate: TranslateService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async ngOnInit() {
    this.sp.show();
    await this.loadPayoutHistory();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async loadPayoutHistory(page: number = 1) {
    this.sp.show();
    this.payoutService.getPayoutHistory(page, this.pagination.limit, this.selectedStatusFilter || undefined)
      .then((response: any) => {
        this.sp.hide();
        const data = response?.data;
        this.payouts = data?.payouts || [];
        this.pagination = data?.pagination || this.pagination;
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Error loading payout history');
      });
  }

  onPageChange(page: number) {
    this.pagination.page = page;
    this.loadPayoutHistory(page);
  }

  applyStatusFilter() {
    this.pagination.page = 1;
    this.loadPayoutHistory(1);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid': return 'badge bg-success';
      case 'pending': return 'badge bg-warning';
      case 'failed': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getMethodBadgeClass(method: string): string {
    switch (method) {
      case 'stripe': return 'badge bg-primary';
      case 'paypal': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(this.pagination.pages, 5);
    let startPage = Math.max(1, this.pagination.page - Math.floor(maxPages / 2));
    let endPage = Math.min(this.pagination.pages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }
}
