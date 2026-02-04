import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../../services/api/rest-api.service';
import { HelperService } from '../../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../services/auth/auth.service';
import { PaymentService } from '../../../../services/payment/payment.service';
declare var $: any;
@Component({
  selector: 'app-view-activity',
  templateUrl: './view-activity.component.html',
  styleUrl: './view-activity.component.scss'
})
export class ViewActivityComponent implements OnInit {
  activity: any = {};
  activityId: string = '';
  selectedSlot: any = null;
  bookingData = {
    participants: '',
    special_requests: ''
  };
  selectedPaymentMethod: string = 'stripe';
  paymentProcessing: boolean = false;
  showStripePaymentForm = false;
  stripeElements: any = null;
  currentBookingId: string = ''; // Add this property
  @ViewChild('paymentElement', { static: false }) paymentElementRef!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService,
    public auth: AuthService,
    private paymentService: PaymentService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activityId = params['activityId'];
      if (this.activityId) {
        this.getActivityDetails();
      } else {
        this.router.navigate(['/partner/list-activities']);
      }
    });
  }

  getActivityDetails() {
    this.sp.show();
    this.api.get(`activity/${this.activityId}`)
      .then((response: any) => {
        this.sp.hide();
        this.activity = response?.data || {};
      })
      .catch((error: any) => {
        this.sp.hide();
        this.helper.failureToast(error?.error?.message || 'Failed to load activity details');
        this.router.navigate(['/partner/list-activities']);
      });
  }

  editActivity() {
    this.router.navigate(['/partner/edit-activity'], { queryParams: { activityId: this.activityId } });
  }

deleteActivity() {
    Swal.fire({
      title: this.translate.instant('POPUPS.DELETE_ACTIVITY_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete(`activity/${this.activityId}`)
          .then((response: any) => {
            this.sp.hide();
            Swal.fire(this.translate.instant('SIDEBAR.ACTIVITIES'), this.translate.instant('MESSAGES.DELETED_SUCCESS'), "success");
            this.router.navigate(['/partner/list-activities']);
          })
          .catch((error: any) => {
            this.sp.hide();
            this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_DELETE_ACTIVITY'));
          });
      }
    });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'rejected': return 'bg-danger';
      case 'draft': return 'bg-secondary';
      case 'inactive': return 'bg-dark';
      default: return 'bg-secondary';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'outdoor': return 'bi-tree';
      case 'indoor': return 'bi-house';
      case 'educational': return 'bi-book';
      case 'sports': return 'bi-trophy';
      case 'arts': return 'bi-palette';
      case 'adventure': return 'bi-compass';
      case 'others': return 'bi-tag';
      default: return 'bi-tag';
    }
  }

  getSlotStatusBadgeClass(status: string, isExpired: boolean = false): string {
    if (isExpired) return 'bg-secondary';
    
    switch (status) {
      case 'available': return 'bg-success';
      case 'full': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      case 'completed': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getBookingStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      case 'completed': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getPaymentStatusBadgeClass(status: string): string {
    switch (status) {
      case 'paid': return 'bg-success';
      case 'pending': return 'bg-warning';
      case 'failed': return 'bg-danger';
      case 'refunded': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  goBack() {
    this.router.navigate(['/partner/list-activities']);
  }

  openBookingModal(slot: any) {
    this.selectedSlot = slot;
    this.bookingData = {
      participants: '',
      special_requests: ''
    };
    this.selectedPaymentMethod = 'stripe'; // Default to Stripe
    $("#bookingModal").modal("show");
  }

  getParticipantOptions(slot: any): number[] {
    const maxAvailable = slot.available_spots - slot.booked_spots - (slot.reserved_spots || 0);
    const maxAllowed = Math.min(maxAvailable, this.activity.max_participants);
    return Array.from({length: maxAllowed}, (_, i) => i + 1);
  }

  createBooking() {
    if (!this.bookingData.participants) {
      this.helper.failureToast('Please select number of participants');
      return;
    }

    // Calculate total amount
    const totalAmount = this.activity.price * parseInt(this.bookingData.participants);
    
    // Validate minimum amount based on payment method
    // Stripe minimum is $0.50, PayPal minimum is $0.01, but we'll use $0.50 for consistency
    const MINIMUM_AMOUNT = 0.50;
    if (totalAmount < MINIMUM_AMOUNT) {
      Swal.fire({
        icon: 'error',
        title: this.translate.instant('POPUPS.INVALID_AMOUNT'),
        text: this.translate.instant('POPUPS.AMOUNT_BELOW_MINIMUM', { amount: totalAmount.toFixed(2), minimum: MINIMUM_AMOUNT }),
        confirmButtonText: this.translate.instant('COMMON.OK')
      });
      return;
    }

    const bookingPayload = {
      activity_id: this.activity._id,
      slot_id: this.selectedSlot._id,
      participants: parseInt(this.bookingData.participants),
      special_requests: this.bookingData.special_requests || '',
      payment_method: this.selectedPaymentMethod
    };

    this.sp.show();
    this.api.post('booking/create', bookingPayload)
      .then((response: any) => {
        this.sp.hide();
        
        if (!response?.data?._id) {
          throw new Error('No booking ID received');
        }
        
        const bookingId = response.data._id;
        this.currentBookingId = bookingId;
        
        // Process payment based on selected method
        this.processPayment(bookingId);
      })
      .catch((error: any) => {
        this.sp.hide();
        this.paymentProcessing = false;
        this.helper.failureToast(error?.error?.message || 'Failed to create booking');
      });
  }

  calculateTotalAmount(): number {
    if (!this.activity.price || !this.bookingData.participants) {
      return 0;
    }
    const pricePerPerson = parseFloat(this.activity.price) || 0;
    const participants = parseInt(this.bookingData.participants) || 0;
    return pricePerPerson * participants;
  }

  async processPayment(bookingId: string) {
    console.log('🔍 Processing payment with method:', this.selectedPaymentMethod);
    console.log('🔍 Booking ID:', bookingId);
    
    this.paymentProcessing = true;

    try {
      if (this.selectedPaymentMethod === 'stripe') {
        console.log('🔵 Routing to Stripe payment');
        await this.processStripePayment(bookingId);
      } else if (this.selectedPaymentMethod === 'paypal') {
        console.log('🟡 Routing to PayPal payment');
        await this.processPayPalPayment(bookingId);
      } else {
        console.error('❌ Invalid payment method:', this.selectedPaymentMethod);
        throw new Error('Invalid payment method selected');
      }
    } catch (error: any) {
      console.error('💥 Payment processing error:', error);
      this.paymentProcessing = false;
      this.helper.failureToast(error?.message || 'Payment failed');
    }
  }

  async processStripePayment(bookingId: string) {
    try {
      // Double-check the amount before creating payment intent
      const totalAmount = this.calculateTotalAmount();
      const STRIPE_MINIMUM_AMOUNT = 0.50;
      
      if (totalAmount < STRIPE_MINIMUM_AMOUNT) {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('POPUPS.INVALID_AMOUNT'),
          text: this.translate.instant('POPUPS.AMOUNT_BELOW_STRIPE_MINIMUM', { amount: totalAmount.toFixed(2), minimum: STRIPE_MINIMUM_AMOUNT }),
          confirmButtonText: this.translate.instant('COMMON.OK')
        });
        this.showStripePaymentForm = false;
        this.paymentProcessing = false;
        return;
      }
      
      const response: any = await this.paymentService.createStripePaymentIntent(bookingId);
      
      if (!response?.data?.client_secret) {
        throw new Error('No client secret received from Stripe');
      }
      
      const clientSecret = response.data.client_secret;
      
      // Show payment form first
      this.showStripePaymentForm = true;
      
      // Wait for DOM to update
      setTimeout(async () => {
        try {
          // Create Stripe Elements for payment collection
          const { stripe, elements, paymentElement } = await this.paymentService.createStripeElements(clientSecret);
          
          // Alternative mounting approach using ViewChild
          if (this.paymentElementRef?.nativeElement) {
            paymentElement.mount(this.paymentElementRef.nativeElement);
            this.stripeElements = { stripe, elements, paymentElement };
          } else {
            // Fallback to getElementById
            const paymentElementContainer = document.getElementById('payment-element');
            if (paymentElementContainer) {
              paymentElement.mount('#payment-element');
              this.stripeElements = { stripe, elements, paymentElement };
            } else {
              throw new Error('Payment element container not found');
            }
          }
          
          // Reset paymentProcessing after successful mounting
          this.paymentProcessing = false;
          
        } catch (mountError) {
          console.error('Error mounting Stripe Elements:', mountError);
          this.showStripePaymentForm = false;
          this.paymentProcessing = false;
          throw mountError;
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Stripe Payment Process Error:', error);
      this.showStripePaymentForm = false;
      this.paymentProcessing = false;
      
      // Check if error is about minimum amount
      if (error?.error?.message?.includes('minimum charge amount') || 
          error?.message?.includes('minimum charge amount')) {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('POPUPS.PAYMENT_AMOUNT_TOO_SMALL'),
          text: this.translate.instant('POPUPS.STRIPE_MINIMUM_CHARGE'),
          confirmButtonText: this.translate.instant('COMMON.OK')
        });
      } else {
        this.helper.failureToast(error?.error?.message || error?.message || this.translate.instant('MESSAGES.PAYMENT_PROCESSING_FAILED'));
      }
      throw error;
    }
  }

  async confirmStripePayment() {
    try {
      if (!this.stripeElements) {
        throw new Error('Stripe elements not initialized');
      }
      
      this.paymentProcessing = true;
      
      // Add timeout to prevent infinite processing
      const timeoutId = setTimeout(() => {
        if (this.paymentProcessing) {
          this.paymentProcessing = false;
          this.helper.failureToast('Payment confirmation timed out. Please check your payment status.');
        }
      }, 30000); // 30 second timeout
      
      const { stripe, elements } = this.stripeElements;
      
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/partner/view-activity`
        },
        redirect: 'if_required'
      });
      
      clearTimeout(timeoutId); // Clear timeout if we get a result
      this.handleStripeResult(result);
      
    } catch (error: any) {
      console.error('Stripe confirmation error:', error);
      this.paymentProcessing = false;
      this.helper.failureToast(error.message || 'Payment confirmation failed');
    }
  }

  handleStripeResult(result: any) {
    console.log('Handling Stripe result:', JSON.stringify(result, null, 2));
    
    // Force reset processing state after 1 second if not already reset
    setTimeout(() => {
      if (this.paymentProcessing) {
        console.log('Force resetting paymentProcessing state');
        this.paymentProcessing = false;
      }
    }, 1000);
    
    if (result?.error) {
      console.error('Stripe Payment Error:', result.error);
      this.paymentProcessing = false;
      this.helper.failureToast(result.error.message);
    } else if (result?.paymentIntent) {
      const status = result.paymentIntent.status;
      
      switch (status) {
        case 'succeeded':
          this.saveStripePaymentData(result.paymentIntent);
          break;
        case 'processing':
          this.paymentProcessing = false;
          this.helper.successToast('Payment is being processed. You will be notified once completed.');
          this.saveStripePaymentData(result.paymentIntent);
          break;
        case 'requires_payment_method':
          this.paymentProcessing = false;
          this.helper.failureToast('Please check your payment details and try again.');
          break;
        default:
          this.paymentProcessing = false;
          this.helper.failureToast('Payment status unclear. Please check your booking history.');
          break;
      }
    } else {
      this.paymentProcessing = false;
      this.helper.successToast('Payment completed successfully!');
      this.handlePaymentSuccess();
    }
  }

  async saveStripePaymentData(paymentIntent: any) {
    try {
      
      const paymentData = {
        booking_id: this.currentBookingId,
        stripe_payment_data: {
          payment_intent_id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          payment_method: paymentIntent.payment_method,
          created: paymentIntent.created,
          client_secret: paymentIntent.client_secret
        }
      };
      
      const response = await this.api.post('booking/update-payment-data', paymentData);
      
      this.handlePaymentSuccess();
    } catch (error: any) {
      console.error('Error saving payment data:', error);
      this.paymentProcessing = false;
      this.helper.failureToast('Payment successful but failed to update booking. Please contact support.');
    }
  }

  async processPayPalPayment(bookingId: string) {
    try {
      // Validate minimum amount for PayPal (PayPal minimum is $0.01, but we use $0.50 for consistency)
      const totalAmount = this.calculateTotalAmount();
      const PAYPAL_MINIMUM_AMOUNT = 0.01; // PayPal's actual minimum
      const PRACTICAL_MINIMUM = 0.50; // Practical minimum for both payment methods
      
      if (totalAmount < PRACTICAL_MINIMUM) {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('POPUPS.INVALID_AMOUNT'),
          text: this.translate.instant('POPUPS.AMOUNT_BELOW_MINIMUM', { amount: totalAmount.toFixed(2), minimum: PRACTICAL_MINIMUM }),
          confirmButtonText: this.translate.instant('COMMON.OK')
        });
        this.paymentProcessing = false;
        return;
      }
      
      // Additional check for PayPal's absolute minimum (though unlikely to trigger)
      if (totalAmount < PAYPAL_MINIMUM_AMOUNT) {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('POPUPS.AMOUNT_TOO_SMALL'),
          text: this.translate.instant('POPUPS.AMOUNT_BELOW_PAYPAL_MINIMUM', { amount: totalAmount.toFixed(2), minimum: PAYPAL_MINIMUM_AMOUNT }),
          confirmButtonText: this.translate.instant('COMMON.OK')
        });
        this.paymentProcessing = false;
        return;
      }
      
      console.log('🟡 Creating PayPal Order for booking:', bookingId);
      console.log('🟡 Selected payment method:', this.selectedPaymentMethod);
      
      // Make sure we're not calling Stripe service
      if (this.selectedPaymentMethod !== 'paypal') {
        throw new Error('Payment method mismatch - expected PayPal');
      }
      
      const response: any = await this.paymentService.createPayPalOrder(bookingId);
      console.log('🟡 PayPal Order Response:', response);
      
      if (!response?.data?.approval_url) {
        throw new Error('No approval URL received from PayPal');
      }
      
      console.log('🟡 Redirecting to PayPal URL:', response.data.approval_url);
      
      // Store booking ID for when user returns
      localStorage.setItem('pendingBooking', JSON.stringify({
        bookingId: bookingId,
        activityId: this.activityId,
        paymentMethod: 'paypal'
      }));
      
      // Redirect to PayPal
      window.location.href = response.data.approval_url;
    } catch (error: any) {
      console.error('🟡 PayPal Payment Process Error:', error);
      this.paymentProcessing = false;
      
      // Check if error is about minimum amount or invalid amount
      if (error?.error?.message?.toLowerCase().includes('minimum') || 
          error?.error?.message?.toLowerCase().includes('amount') ||
          error?.message?.toLowerCase().includes('minimum') ||
          error?.message?.toLowerCase().includes('amount')) {
        Swal.fire({
          icon: 'error',
          title: this.translate.instant('POPUPS.PAYMENT_AMOUNT_ERROR'),
          text: error?.error?.message || error?.message || this.translate.instant('POPUPS.PAYMENT_AMOUNT_INVALID'),
          confirmButtonText: this.translate.instant('COMMON.OK')
        });
      } else {
        this.helper.failureToast(error?.error?.message || error?.message || this.translate.instant('MESSAGES.PAYPAL_PAYMENT_FAILED'));
      }
      throw error;
    }
  }

  handlePaymentSuccess() {
    console.log('Handling payment success');
    this.paymentProcessing = false;
    this.showStripePaymentForm = false;
    $("#bookingModal").modal("hide");
    this.helper.successToast('Payment successful! Booking confirmed.');
    this.getActivityDetails();
  }

  isSlotExpired(slot: any): boolean {
    const currentDate = new Date();
    const slotEndDate = new Date(slot.end_time);
    return slotEndDate < currentDate;
  }

  cancelStripePayment() {
    this.showStripePaymentForm = false;
    this.stripeElements = null;
    this.paymentProcessing = false;
    this.sp.hide();
    
    // Unmount any existing Stripe elements
    const paymentElement = document.getElementById('payment-element');
    if (paymentElement) {
      paymentElement.innerHTML = '';
    }
  }

  resetPaymentState() {
    console.log('Manually resetting payment state');
    this.paymentProcessing = false;
    this.helper.infoToast('Payment state reset. Please try again or check your payment status.');
  }

  // Add this method to open image in modal
  openImageModal(imageUrl: string) {
    // You can implement a modal or lightbox here
    // For now, opening in new tab
    window.open(imageUrl, '_blank');
  }

  getPartnerAbout(): string {
    const about = this.activity?.partner_id?.partner_profile?.about;
    return about != null && String(about).trim() !== '' ? String(about).trim() : '';
  }

  getPartnerMapCoordinates(): string {
    const coords = this.activity?.partner_id?.partner_profile?.map_location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return '';
    return `${coords[0]}, ${coords[1]}`;
  }

  getPartnerMapGoogleUrl(): string {
    const coords = this.activity?.partner_id?.partner_profile?.map_location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return '';
    const lat = coords[0];
    const lng = coords[1];
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  getPartnerGallery(): string[] {
    const g = this.activity?.partner_id?.partner_profile?.gallery;
    return Array.isArray(g) ? g : [];
  }

  selectedEnlargedImage: string | null = null;

  openEnlargeImageModal(imageUrl: string) {
    this.selectedEnlargedImage = imageUrl;
    $('#enlargeImageModal').modal('show');
  }

  closeEnlargeImageModal() {
    this.selectedEnlargedImage = null;
    $('#enlargeImageModal').modal('hide');
  }
}
