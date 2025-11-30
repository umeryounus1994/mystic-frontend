import { Injectable } from '@angular/core';
import { RestApiService } from '../api/rest-api.service';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { Observable, from } from 'rxjs';
import { PartnerRegistrationRequest } from '../../models/PartnerRegistrationRequest.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = false;
  user : any;

  isAdmin = false;
  isSubAdmin = false;
  isFamily = false;
  isPartner = false;
  constructor(private api: RestApiService, private router: Router, private storage: StorageService) {

    if(!(Object.keys(this.storage.userDetails).length === 0 && this.storage.userDetails.constructor === Object)) {
      this.isLoggedIn = true;
      this.user = this.storage.userDetails;
      this.roleCheck();
    }
  }

  login(user_details: any) {
    return new Promise((resolve, reject) => {
      this.api.postData('admin/login', {email: user_details.email, password: user_details.password})
      .then((response: any) => {
       
        if (response.data) {
          if(response?.data?.user && !response?.data?.user_sub){
            // Check if user type is 'user' - block login
            if(response.data.user.user_type === 'user') {
              reject({ error: { message: 'You should login through the mobile app' } });
              return;
            }
            
            localStorage.setItem('mystic9834!@', JSON.stringify(response.data.user));
            this.storage.saveUserDetails(response.data.user);
            this.isLoggedIn = true;
            this.user = response.data.user;
            this.roleCheck();
            resolve('open');
          }
          if(response.data.user_sub && !response?.data?.user){
            // Check if user_sub type is 'user' - block login
            if(response.data.user_sub.user_type === 'user') {
              reject({ error: { message: 'You should login through the mobile app' } });
              return;
            }
            
            localStorage.setItem('mystic9834!@', JSON.stringify(response.data.user_sub));
            this.storage.saveUserDetails(response.data.user_sub);
            this.isLoggedIn = true;
            this.user = response.data.user_sub;
            this.roleCheck();
            resolve('open');
          }
        } else {
            resolve('false');
        }
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  logout() {
    // Reset all auth state:
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.isSubAdmin = false;
    this.isPartner = false;
    this.isFamily = false;
    this.user = undefined;
    
    // Clear storage but keep remembered credentials
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    localStorage.clear();
    if (rememberedEmail) localStorage.setItem('rememberedEmail', rememberedEmail);
    if (rememberedPassword) localStorage.setItem('rememberedPassword', rememberedPassword);
    
    this.storage.removeUserDetails();
    
    // Navigate to login page immediately
    this.router.navigateByUrl('/auth/login', { skipLocationChange: false });
  }

  roleCheck() {
    if (this.user.user_type == 'admin') {
      this.isAdmin = true;
      this.isSubAdmin = false;
      this.isPartner = false;
      this.isFamily = false;
    }
    if (this.user.user_type == 'subadmin')  {
      this.isAdmin = false;
      this.isSubAdmin = true;
      this.isPartner = false;
      this.isFamily = false;
    }
    if (this.user.user_type == 'family') {
      this.isAdmin = false;
      this.isSubAdmin = false;
      this.isPartner = false;
      this.isFamily = true;
    }
    if (this.user.user_type == 'partner') {
      this.isAdmin = false;
      this.isSubAdmin = false;
      this.isPartner = true;
      this.isFamily = false;
    }
  }

  registerPartner(partnerData: PartnerRegistrationRequest): Observable<any> {
    const formData = new FormData();
    
    // Append basic fields with trimming
    formData.append('username', partnerData.username?.trim() || '');
    formData.append('email', partnerData.email?.trim() || '');
    formData.append('password', partnerData.password || '');
    formData.append('confirm_password', partnerData.confirm_password || '');
    formData.append('user_type', partnerData.user_type || 'partner');
    
    // Append image if provided
    if (partnerData.image) {
      formData.append('image', partnerData.image, partnerData.image.name);
    }
    
    // Append partner profile as JSON - include routing_number in bank_details
    formData.append('partner_profile', JSON.stringify({
      business_name: partnerData.partner_profile.business_name?.trim() || '',
      business_description: partnerData.partner_profile.business_description?.trim() || '',
      phone: partnerData.partner_profile.phone?.trim() || '',
      commission_rate: partnerData.partner_profile.commission_rate || 15,
      bank_details: {
        account_number: partnerData.partner_profile.bank_details.account_number?.trim() || '',
        routing_number: partnerData.partner_profile.bank_details.routing_number?.trim() || '', // Move routing_number here
        account_holder: partnerData.partner_profile.bank_details.account_holder?.trim() || ''
      },
      approval_status: partnerData.partner_profile.approval_status || 'pending'
    }));

    return from(this.api.postData('user/partner-signup', formData).catch(error => {
      // Ensure error is properly propagated
      console.error('Partner registration API error:', error);
      throw error;
    }));
  }

  registerFamily(familyData: any): Observable<any> {
    const formData = new FormData();
    
    // Append basic fields
    formData.append('username', familyData.username);
    formData.append('email', familyData.email);
    formData.append('password', familyData.password);
    formData.append('confirm_password', familyData.confirm_password);
    formData.append('user_type', familyData.user_type);
    
    // Append image if provided
    if (familyData.image) {
      formData.append('image', familyData.image);
    }
    
    return from(this.api.postData('user/family-signup', formData));
  }
}
