import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from '../../services/helper/helper.service';

@Component({
  selector: 'app-paypal-cancel',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="card">
            <div class="card-body">
              <i class="bi bi-x-circle text-danger" style="font-size: 3rem;"></i>
              <h3 class="mt-3">Payment Cancelled</h3>
              <p>Your PayPal payment was cancelled. You can try again.</p>
              <button class="btn btn-primary" (click)="goBack()">
                Go Back to Activities
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaypalCancelComponent implements OnInit {
  
  constructor(
    private router: Router,
    private helper: HelperService
  ) {}

  ngOnInit() {
    this.helper.infoToast('PayPal payment was cancelled');
    
    // Clean up pending booking
    localStorage.removeItem('pendingBooking');
  }

  goBack() {
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
      const bookingInfo = JSON.parse(pendingBooking);
      this.router.navigate(['/partner/view-activity'], {
        queryParams: { activityId: bookingInfo.activityId }
      });
    } else {
      this.router.navigate(['/partner/list-activities']);
    }
  }
}