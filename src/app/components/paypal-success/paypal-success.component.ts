import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RestApiService } from '../../services/api/rest-api.service';
import { HelperService } from '../../services/helper/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-paypal-success',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="card">
            <div class="card-body">
              <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
              <h3 class="mt-3">Processing Payment...</h3>
              <p>Please wait while we confirm your PayPal payment.</p>
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
    private sp: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const paymentId = params['paymentId'];
      const payerId = params['PayerID'];
      
      if (paymentId && payerId) {
        this.executePayPalPayment(paymentId, payerId);
      } else {
        this.helper.failureToast('Invalid PayPal response');
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
        this.helper.successToast('Payment successful! Booking confirmed.');
        
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
        throw new Error('No booking ID received');
      }
      
    } catch (error: any) {
      this.sp.hide();
      console.error('PayPal execution error:', error);
      this.helper.failureToast(error?.error?.message || 'Payment execution failed');
      this.router.navigate(['/partner/list-activities']);
    }
  }
}