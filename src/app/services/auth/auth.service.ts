import { Injectable } from '@angular/core';
import { RestApiService } from '../api/rest-api.service';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = false;
  user : any;

  isAdmin = false;
  isCustomer = false;
  isSurveyor = false;
  isSupplier = false;
  isTechnician = false;
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
          localStorage.setItem('mystic9834!@', JSON.stringify(response.data.user));
          this.storage.saveUserDetails(response.data.user);
          this.isLoggedIn = true;
          this.user = response.data.user;
          this.isAdmin = true;
            resolve('open');
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
    // Reset:
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.isCustomer = false;
    this.user = undefined;
    localStorage.clear();
    this.storage.removeUserDetails();

    // Redirect:
    this.router.navigate(['/auth/login']);
  }

  roleCheck() {
    if (this.user.role === 'admin') {
      this.isAdmin = true;
      this.isCustomer = false;
    }
    if (this.user.role === 'client')  {
      this.isAdmin = false;
      this.isCustomer = true;
    }
  }
}
