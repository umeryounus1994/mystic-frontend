import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PayoutService } from '../../../../services/payout/payout.service';
import { HelperService } from '../../../../services/helper/helper.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payout-settings',
  templateUrl: './payout-settings.component.html',
  styleUrl: './payout-settings.component.scss'
})
export class PayoutSettingsComponent implements OnInit {
  payoutMethods: any = {};
  preferredMethod: string = '';
  paypalEmail: string = '';
  stripeStatus: any = {};
  newPaypalEmail: string = '';
  stripeAccountId: string = '';
  newStripeAccountId: string = '';
  bankDetailsConfigured: boolean = false;
  bankDetails: any = {
    account_number: '',
    routing_number: '',
    account_holder: ''
  };
  newBankDetails: any = {
    account_number: '',
    routing_number: '',
    account_holder: ''
  };

  constructor(
    private sp: NgxSpinnerService,
    private payoutService: PayoutService,
    private helper: HelperService,
    private auth: AuthService,
    public translate: TranslateService
  ) { }

  async ngOnInit() {
    this.sp.show();
    await this.loadPayoutMethods();
  }

  async loadPayoutMethods() {
    this.payoutService.getPartnerPayoutMethods()
      .then((response: any) => {
        this.sp.hide();
        const data = response?.data;
        this.payoutMethods = data;
        this.preferredMethod = data?.preferred_method || 'bank_transfer';
        this.paypalEmail = data?.paypal?.email || '';
        this.newPaypalEmail = this.paypalEmail;
        this.stripeAccountId = data?.stripe?.account_id || data?.stripe?.stripe_account_id || '';
        this.newStripeAccountId = this.stripeAccountId;
        this.stripeStatus = data?.stripe || {};
        
        // Load bank details from user profile
        const user = this.auth.user;
        const userBankDetails = user?.partner_profile?.bank_details;
        if (userBankDetails) {
          this.bankDetails = {
            account_number: userBankDetails.account_number || '',
            routing_number: userBankDetails.routing_number || '',
            account_holder: userBankDetails.account_holder || ''
          };
          this.newBankDetails = { ...this.bankDetails };
        }
        this.bankDetailsConfigured = !!(this.bankDetails.account_number && 
                                       this.bankDetails.routing_number && 
                                       this.bankDetails.account_holder);
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Error loading payout methods');
      });
  }

  async updatePreferredMethod(method: string) {
    if (method === this.preferredMethod) return;

    if (method === 'stripe' && !this.isMethodAvailable('stripe')) {
      Swal.fire({
        title: 'Stripe Not Configured',
        text: 'Please add your Stripe Connect Account ID below to use Stripe payouts.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (method === 'paypal' && !this.isMethodAvailable('paypal')) {
      Swal.fire('Error', 'PayPal email is not configured. Please add your PayPal email first.', 'error');
      return;
    }

    this.sp.show();
    this.payoutService.updatePreferredPayoutMethod(method)
      .then((response: any) => {
        this.sp.hide();
        this.preferredMethod = method;
        Swal.fire('Success', 'Preferred payout method updated', 'success');
        this.loadPayoutMethods();
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Error updating preferred method');
      });
  }

  async updatePayPalEmail() {
    if (!this.newPaypalEmail || !this.validateEmail(this.newPaypalEmail)) {
      this.helper.failureToast('Please enter a valid PayPal email');
      return;
    }

    const result = await Swal.fire({
      title: 'Update PayPal Email?',
      text: `Set PayPal email to ${this.newPaypalEmail}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      this.sp.show();
      const partnerId = this.auth.user?._id || this.auth.user?.id;
      if (!partnerId) {
        this.sp.hide();
        this.helper.failureToast('Partner ID not found');
        return;
      }

      this.payoutService.updatePartnerPayPalEmail(partnerId, this.newPaypalEmail)
        .then((response: any) => {
          this.sp.hide();
          this.paypalEmail = this.newPaypalEmail;
          Swal.fire('Success', 'PayPal email updated', 'success');
          this.loadPayoutMethods();
        })
        .catch((error: any) => {
          this.sp.hide();
          this.helper.failureToast(error?.error?.message || 'Error updating PayPal email');
        });
    }
  }

  async updateStripeAccountId() {
    if (!this.newStripeAccountId || this.newStripeAccountId.trim() === '') {
      this.helper.failureToast('Please enter a valid Stripe Connect account ID');
      return;
    }

    // Validate format (should start with acct_)
    if (!this.newStripeAccountId.startsWith('acct_')) {
      this.helper.failureToast('Stripe Account ID must start with "acct_"');
      return;
    }

    const result = await Swal.fire({
      title: 'Update Stripe Account ID?',
      text: `Set Stripe Account ID to ${this.newStripeAccountId}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      this.sp.show();
      const partnerId = this.auth.user?._id || this.auth.user?.id;
      if (!partnerId) {
        this.sp.hide();
        this.helper.failureToast('Partner ID not found');
        return;
      }

      this.payoutService.updatePartnerStripeAccountId(partnerId, this.newStripeAccountId)
        .then((response: any) => {
          this.sp.hide();
          this.stripeAccountId = this.newStripeAccountId;
          
          // Get message from response
          const responseMessage = response?.message || response?.data?.message || 'Stripe Account ID updated successfully';
          
          // Determine icon based on whether there's a warning
          const hasWarning = response?.data?.warning || response?.message?.toLowerCase().includes('failed');
          const icon = hasWarning ? 'warning' : 'success';
          const title = hasWarning ? 'Account ID Saved' : 'Success';
          
          // Show message from backend
          Swal.fire({
            title: title,
            text: responseMessage,
            icon: icon,
            confirmButtonText: 'OK'
          });
          
          this.loadPayoutMethods();
        })
        .catch((error: any) => {
          this.sp.hide();
          this.helper.failureToast(error?.error?.message || 'Error updating Stripe Account ID');
        });
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validateAccountNumber(accountNumber: string): boolean {
    // Remove spaces and check if it's 8-17 digits
    const cleaned = accountNumber.replace(/\s/g, '');
    return /^\d{8,17}$/.test(cleaned);
  }

  validateRoutingNumber(routingNumber: string): boolean {
    // Remove spaces and check if it's exactly 9 digits
    const cleaned = routingNumber.replace(/\s/g, '');
    return /^\d{9}$/.test(cleaned);
  }

  validateAccountHolder(accountHolder: string): boolean {
    // Check if it's 2-100 characters
    return accountHolder.trim().length >= 2 && accountHolder.trim().length <= 100;
  }

  async updateBankDetails() {
    // Validate all fields
    if (!this.validateAccountNumber(this.newBankDetails.account_number)) {
      this.helper.failureToast('Account number must be 8-17 digits');
      return;
    }

    if (!this.validateRoutingNumber(this.newBankDetails.routing_number)) {
      this.helper.failureToast('Routing number must be exactly 9 digits');
      return;
    }

    if (!this.validateAccountHolder(this.newBankDetails.account_holder)) {
      this.helper.failureToast('Account holder name must be 2-100 characters');
      return;
    }

    const result = await Swal.fire({
      title: 'Update Bank Details?',
      text: 'Are you sure you want to update your bank account details?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      this.sp.show();
      const partnerId = this.auth.user?._id || this.auth.user?.id;
      if (!partnerId) {
        this.sp.hide();
        this.helper.failureToast('Partner ID not found');
        return;
      }

      // Remove spaces from account and routing numbers
      const bankDetailsToSend = {
        account_number: this.newBankDetails.account_number.replace(/\s/g, ''),
        routing_number: this.newBankDetails.routing_number.replace(/\s/g, ''),
        account_holder: this.newBankDetails.account_holder.trim()
      };

      this.payoutService.updateBankDetails(partnerId, bankDetailsToSend)
        .then((response: any) => {
          this.sp.hide();
          this.bankDetails = { ...this.newBankDetails };
          this.bankDetailsConfigured = true;
          
          // Get message from response
          const responseMessage = response?.message || 'Bank details updated successfully';
          
          Swal.fire({
            title: 'Success',
            text: responseMessage,
            icon: 'success',
            confirmButtonText: 'OK'
          });
          
          // Reload user data to reflect changes
          if (this.auth.user?.partner_profile) {
            this.auth.user.partner_profile.bank_details = bankDetailsToSend;
          }
          this.loadPayoutMethods();
        })
        .catch((error: any) => {
          this.sp.hide();
          this.helper.failureToast(error?.error?.message || 'Error updating bank details');
        });
    }
  }

  isMethodAvailable(method: string): boolean {
    if (method === 'stripe') {
      return !!this.stripeAccountId && this.stripeAccountId.trim() !== '';
    }
    if (method === 'paypal') {
      return !!this.paypalEmail;
    }
    if (method === 'bank_transfer') {
      return true; // Bank transfer is always available (bank details collected during registration)
    }
    return false;
  }
}
