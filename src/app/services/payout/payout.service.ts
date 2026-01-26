import { Injectable } from '@angular/core';
import { RestApiService } from '../api/rest-api.service';

@Injectable({
  providedIn: 'root'
})
export class PayoutService {

  constructor(private api: RestApiService) { }

  // ========== Unified Payout APIs ==========
  
  /**
   * Send Payout (Auto-selects method based on partner preference)
   * POST /api/v1/payout/send
   */
  sendPayout(commissionId: string) {
    return this.api.post('payout/send', { commission_id: commissionId });
  }

  /**
   * Batch Payouts
   * POST /api/v1/payout/batch
   */
  batchPayouts(commissionIds: string[]) {
    return this.api.post('payout/batch', { commission_ids: commissionIds });
  }

  /**
   * Trigger Automatic Payouts (Admin only)
   * POST /api/v1/payout/trigger-automatic
   */
  triggerAutomaticPayouts() {
    return this.api.post('payout/trigger-automatic', {});
  }

  /**
   * Get Partner Payout Methods (Partner endpoint)
   * GET /api/v1/payout/methods
   */
  getPartnerPayoutMethods() {
    return this.api.get('payout/methods');
  }

  /**
   * Update Preferred Payout Method (Partner endpoint)
   * POST /api/v1/payout/preferred-method
   */
  updatePreferredPayoutMethod(preferredMethod: string) {
    return this.api.post('payout/preferred-method', { preferred_method: preferredMethod });
  }

  /**
   * Get Payout History (Partner endpoint)
   * GET /api/v1/payout/history?page=1&limit=20&status=paid
   */
  getPayoutHistory(page: number = 1, limit: number = 20, status?: string) {
    let path = `payout/history?page=${page}&limit=${limit}`;
    if (status) {
      path += `&status=${status}`;
    }
    return this.api.get(path);
  }

  // ========== Stripe Connect APIs ==========

  /**
   * Create Stripe Connect Account
   * POST /api/v1/stripe-connect/create-account
   */
  createStripeConnectAccount(partnerId: string) {
    return this.api.post('stripe-connect/create-account', { partner_id: partnerId });
  }

  /**
   * Get Account Status
   * GET /api/v1/stripe-connect/account-status/:partner_id
   */
  getStripeConnectAccountStatus(partnerId: string) {
    return this.api.get(`stripe-connect/account-status/${partnerId}`);
  }

  /**
   * Create Onboarding Link (Re-onboarding)
   * POST /api/v1/stripe-connect/create-onboarding-link
   */
  createStripeOnboardingLink(partnerId: string) {
    return this.api.post('stripe-connect/create-onboarding-link', { partner_id: partnerId });
  }

  /**
   * Transfer to Partner
   * POST /api/v1/stripe-connect/transfer
   */
  transferToPartner(commissionId: string, amount: number) {
    return this.api.post('stripe-connect/transfer', { commission_id: commissionId, amount });
  }

  /**
   * Get Transfer Details
   * GET /api/v1/stripe-connect/transfer/:transfer_id
   */
  getTransferDetails(transferId: string) {
    return this.api.get(`stripe-connect/transfer/${transferId}`);
  }

  // ========== PayPal Payout APIs ==========

  /**
   * Send Partner Payout
   * POST /api/v1/paypal-payout/send-payout
   */
  sendPayPalPayout(commissionId: string) {
    return this.api.post('paypal-payout/send-payout', { commission_id: commissionId });
  }

  /**
   * Batch Payout
   * POST /api/v1/paypal-payout/batch-payout
   */
  batchPayPalPayouts(commissionIds: string[]) {
    return this.api.post('paypal-payout/batch-payout', { commission_ids: commissionIds });
  }

  /**
   * Get Payout Status
   * GET /api/v1/paypal-payout/payout-status/:payout_batch_id
   */
  getPayPalPayoutStatus(batchId: string) {
    return this.api.get(`paypal-payout/payout-status/${batchId}`);
  }

  /**
   * Update Partner PayPal Email
   * POST /api/v1/paypal-payout/update-paypal-email
   */
  updatePartnerPayPalEmail(partnerId: string, paypalEmail: string) {
    return this.api.post('paypal-payout/update-paypal-email', { partner_id: partnerId, paypal_email: paypalEmail });
  }

  /**
   * Update Partner Stripe Account ID
   * POST /api/v1/stripe-connect/update-account-id
   */
  updatePartnerStripeAccountId(partnerId: string, stripeAccountId: string) {
    return this.api.post('stripe-connect/update-account-id', { partner_id: partnerId, stripe_account_id: stripeAccountId });
  }

  /**
   * Update Partner Bank Details
   * POST /api/v1/payout/bank-details
   */
  updateBankDetails(partnerId: string, bankDetails: { account_number: string; routing_number: string; account_holder: string }) {
    return this.api.post('payout/bank-details', {
      partner_id: partnerId,
      account_number: bankDetails.account_number,
      routing_number: bankDetails.routing_number,
      account_holder: bankDetails.account_holder
    });
  }
}
