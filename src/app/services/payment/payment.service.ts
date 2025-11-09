import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { RestApiService } from '../api/rest-api.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null>;

  constructor(private api: RestApiService) {
    this.stripePromise = loadStripe(environment.stripe.publishableKey);
  }

  async createStripePaymentIntent(bookingData: any) {
    try {
      console.log('PaymentService: Creating Stripe Payment Intent');
      const response = await this.api.post('payment/create-payment-intent', {booking_id: bookingData});
      console.log('PaymentService: Stripe API Response:', response);
      return response;
    } catch (error) {
      console.error('PaymentService: Stripe Payment Intent Error:', error);
      throw error;
    }
  }

  async createPayPalOrder(bookingData: any) {
    try {
      console.log('PaymentService: Creating PayPal Order');
      const response = await this.api.post('payment/create-paypal-order', {booking_id:bookingData});
      console.log('PaymentService: PayPal API Response:', response);
      return response;
    } catch (error) {
      console.error('PaymentService: PayPal Order Error:', error);
      throw error;
    }
  }

  async confirmStripePayment(clientSecret: string, paymentElement?: any) {
    try {
      console.log('PaymentService: Confirming Stripe Payment');
      const stripe = await this.stripePromise;
      
      if (paymentElement) {
        // Use confirmPayment with Elements
        const result = await stripe?.confirmPayment({
          elements: paymentElement,
          confirmParams: {
            return_url: `${window.location.origin}/partner/view-activity`
          }
        });
        console.log('PaymentService: Stripe Confirmation Result:', result);
        return result;
      } else {
        // Fallback: redirect to Stripe Checkout
        const result = await stripe?.confirmPayment({
          clientSecret,
          confirmParams: {
            return_url: `${window.location.origin}/partner/view-activity`
          },
          redirect: 'if_required'
        });
        console.log('PaymentService: Stripe Confirmation Result:', result);
        return result;
      }
    } catch (error) {
      console.error('PaymentService: Stripe Confirmation Error:', error);
      throw error;
    }
  }

  async createStripeElements(clientSecret: string) {
    try {
      const stripe = await this.stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');
      
      const elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe'
        }
      });
      
      const paymentElement = elements.create('payment');
      
      return { stripe, elements, paymentElement };
    } catch (error) {
      console.error('Error creating Stripe Elements:', error);
      throw error;
    }
  }
}
