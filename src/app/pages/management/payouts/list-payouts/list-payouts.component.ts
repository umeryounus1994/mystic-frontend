import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PayoutService } from '../../../../services/payout/payout.service';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-payouts',
  templateUrl: './list-payouts.component.html',
  styleUrl: './list-payouts.component.scss'
})
export class ListPayoutsComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };

  allPayouts: any = [];
  filteredPayouts: any = [];
  selectedStatusFilter = '';
  selectedMethodFilter = '';
  
  stats = {
    total: 0,
    unpaid: 0,
    paid: 0,
    failed: 0,
    totalAmount: 0
  };

  constructor(
    private sp: NgxSpinnerService,
    private payoutService: PayoutService,
    private api: RestApiService,
    private helper: HelperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async ngOnInit() {
    this.sp.show();
    await this.getAllPayouts();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async getAllPayouts() {
    this.allPayouts = [];
    // Get all commissions from commission endpoint
    this.api.get('commission?page=1&limit=1000')
      .then((response: any) => {
        this.sp.hide();
        this.allPayouts = response?.data?.commissions || [];
        
        // Reapply filters after data refresh
        this.applyFilters();
        this.calculateStats();
        
        // Force table refresh
        this.refreshTable();
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Error fetching payouts');
      });
  }

  applyFilters() {
    // Clear filtered array first to force change detection
    this.filteredPayouts = [];
    this.cdr.detectChanges();
    
    // Use setTimeout to ensure Angular processes the empty array first
    setTimeout(() => {
      let filtered = [...this.allPayouts];
      
      // Apply status filter
      if (this.selectedStatusFilter) {
        filtered = filtered.filter((p: any) => 
          p.payout_status === this.selectedStatusFilter
        );
      }
      
      // Apply method filter
      if (this.selectedMethodFilter) {
        filtered = filtered.filter((p: any) => {
          const statusMatch = !this.selectedStatusFilter || p.payout_status === this.selectedStatusFilter;
          const methodMatch = p.payout_method === this.selectedMethodFilter;
          return statusMatch && methodMatch;
        });
      }
      
      this.filteredPayouts = filtered;
      this.cdr.detectChanges();
      
      // Force DataTables refresh
      setTimeout(() => {
        const tableElement = document.getElementById('dtable');
        if (tableElement) {
          $(tableElement).removeClass('dataTable');
          this.cdr.detectChanges();
        }
      }, 50);
    }, 10);
  }

  refreshTable() {
    // Force DataTables to refresh by removing and re-adding the dataTable class
    setTimeout(() => {
      const tableElement = document.getElementById('dtable');
      if (tableElement) {
        $(tableElement).removeClass('dataTable');
        this.cdr.detectChanges();
      }
    }, 100);
  }

  calculateStats() {
    this.stats = {
      total: this.allPayouts.length,
      unpaid: this.allPayouts.filter((p: any) => p.payout_status === 'unpaid').length,
      paid: this.allPayouts.filter((p: any) => p.payout_status === 'paid').length,
      failed: this.allPayouts.filter((p: any) => p.payout_status === 'failed').length,
      totalAmount: this.allPayouts.reduce((sum: number, p: any) => sum + (p.net_amount || 0), 0)
    };
  }

  applyStatusFilter() {
    this.applyFilters();
  }

  applyMethodFilter() {
    this.applyFilters();
  }

  async processPayout(payout: any) {
    const result = await Swal.fire({
      title: 'Process Payout?',
      text: `Send $${payout.net_amount?.toFixed(2)} to partner?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Process',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      this.sp.show();
      // Use unified payout endpoint (auto-selects method)
      this.payoutService.sendPayout(payout._id)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire('Success', 'Payout processed successfully', 'success');
          // Refresh data and table
          this.getAllPayouts();
        })
        .catch((error: any) => {
          this.sp.hide();
          this.helper.failureToast(error?.error?.message || 'Error processing payout');
        });
    }
  }

  async triggerAutomaticPayouts() {
    const result = await Swal.fire({
      title: 'Trigger Automatic Payouts?',
      text: 'This will process all eligible unpaid commissions',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Trigger',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      this.sp.show();
          this.payoutService.triggerAutomaticPayouts()
        .then((response: any) => {
          this.sp.hide();
          const data = response?.data;
          Swal.fire({
            title: 'Payouts Processed',
            html: `
              <p>Processed: ${data?.processed || 0}</p>
              <p>Failed: ${data?.failed || 0}</p>
              <p>Total Amount: $${data?.totalAmount?.toFixed(2) || '0.00'}</p>
            `,
            icon: 'success'
          });
          // Refresh data and table
          this.getAllPayouts();
        })
        .catch((error: any) => {
          this.sp.hide();
          this.helper.failureToast(error?.error?.message || 'Error triggering payouts');
        });
    }
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
}
