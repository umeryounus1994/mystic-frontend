/**
 * @deprecated Legacy multipart signup shape. Partner signup now uses JSON only:
 * { first_name, last_name, email, password } via AuthService.registerPartner (see SimpleSignupPayload).
 * Bank and payout details are collected in Partner profile / Payout settings after login.
 */
export interface PartnerRegistrationRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  image?: File;
  user_type: 'partner';

  partner_profile: {
    business_name: string;
    business_description: string;
    phone: string;
    commission_rate?: number;
    payout_preference?: {
      preferred_method: 'bank_transfer' | 'paypal' | 'stripe';
    };
    paypal_details?: {
      paypal_email: string;
    };
    stripe_details?: {
      stripe_account_id: string;
    };
    bank_details: {
      account_number: string;
      routing_number: string;
      account_holder: string;
    };
    approval_status: 'pending';
  };
}
