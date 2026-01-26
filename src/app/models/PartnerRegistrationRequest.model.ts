export interface PartnerRegistrationRequest {
  // Basic User fields
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  image?: File;
  user_type: 'partner';  // Set to 'partner' from enum ["family", "partner", "admin"]
  
  // Partner profile fields (from partner_profile in User model)
  partner_profile: {
    business_name: string;
    business_description: string;
    phone: string;
    commission_rate?: number;  // defaults to 15
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
    approval_status: 'pending';  // default value
  };
}