import { Injectable } from '@angular/core';
import { RestApiService } from '../api/rest-api.service';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { Observable, from } from 'rxjs';
/** JSON body for POST user/partner-signup and user/family-signup */
export interface SimpleSignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

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

  registerPartner(payload: SimpleSignupPayload): Observable<any> {
    const body = {
      first_name: payload.first_name?.trim() || '',
      last_name: payload.last_name?.trim() || '',
      email: payload.email?.trim() || '',
      password: payload.password || ''
    };
    return from(this.api.postDataLogin('user/partner-signup', body));
  }

  registerFamily(payload: SimpleSignupPayload): Observable<any> {
    const body = {
      first_name: payload.first_name?.trim() || '',
      last_name: payload.last_name?.trim() || '',
      email: payload.email?.trim() || '',
      password: payload.password || ''
    };
    return from(this.api.postDataLogin('user/family-signup', body));
  }

  verifyEmailToken(token: string): Promise<any> {
    return this.api.postDataLogin('user/verify-email', { token });
  }

  resendVerificationEmail(email: string): Promise<any> {
    return this.api.postDataLogin('user/resend-verification-email', { email: email?.trim() || '' });
  }
}
