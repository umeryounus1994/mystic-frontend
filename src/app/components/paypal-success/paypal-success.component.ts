import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestApiService } from '../../services/api/rest-api.service';
import { HelperService } from '../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-paypal-success',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="card">
            <div class="card-body">
              <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
              <h3 class="mt-3">{{ 'PAYMENT.PROCESSING_PAYMENT' | translate }}</h3>
              <p>{{ 'PAYMENT.PLEASE_WAIT_PAYPAL' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaypalSuccessComponent implements OnInit {
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: RestApiService,
    private helper: HelperService,
    private sp: NgxSpinnerService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const paymentId = params['paymentId'];
      const payerId = params['PayerID'];
      
      if (paymentId && payerId) {
        this.executePayPalPayment(paymentId, payerId);
      } else {
        this.helper.failureToast(this.translate.instant('PAYMENT.INVALID_PAYPAL_RESPONSE'));
        this.router.navigate(['/partner/list-activities']);
      }
    });
  }

  async executePayPalPayment(paymentId: string, payerId: string) {
    try {
      this.sp.show();
      
      const response: any = await this.api.post('payment/execute-paypal-payment', {
        payment_id: paymentId,
        payer_id: payerId
      });
      
      this.sp.hide();
      
      if (response?.data?.booking_id) {
        this.helper.successToast(this.translate.instant('PAYMENT.PAYMENT_SUCCESSFUL_BOOKING_CONFIRMED'));
        
        // Get pending booking info from localStorage
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
          const bookingInfo = JSON.parse(pendingBooking);
          localStorage.removeItem('pendingBooking');
          
          // Redirect back to activity view
          this.router.navigate(['/partner/view-activity'], {
            queryParams: { activityId: bookingInfo.activityId }
          });
        } else {
          this.router.navigate(['/booking/list-bookings']);
        }
      } else {
        throw new Error(this.translate.instant('PAYMENT.NO_BOOKING_ID'));
      }
      
    } catch (error: any) {
      this.sp.hide();
      console.error('PayPal execution error:', error);
      this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.PAYMENT_EXECUTION_FAILED'));
      this.router.navigate(['/partner/list-activities']);
    }
  }
}