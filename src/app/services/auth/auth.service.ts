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
  isSubAdmin = false;
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
          if(response?.data?.user && !response?.data?.user_sub){
            localStorage.setItem('mystic9834!@', JSON.stringify(response.data.user));
            this.storage.saveUserDetails(response.data.user);
            this.isLoggedIn = true;
            this.user = response.data.user;
            this.isAdmin = true;
            this.isSubAdmin = false;
              resolve('open');
          }
          if(response.data.user_sub && !response?.data?.user){
            localStorage.setItem('mystic9834!@', JSON.stringify(response.data.user_sub));
            this.storage.saveUserDetails(response.data.user_sub);
            this.isLoggedIn = true;
            this.user = response.data.user_sub;
            this.isSubAdmin = true;
            this.isAdmin = false;
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
    // Reset:
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.isSubAdmin = false;
    this.user = undefined;
    localStorage.clear();
    this.storage.removeUserDetails();

    // Redirect:
    this.router.navigate(['/auth/login']);
  }

  roleCheck() {
    if (this.user.user_type == 'admin') {
      this.isAdmin = true;
      this.isSubAdmin = false;
    }
    if (this.user.user_type == 'subadmin')  {
      this.isAdmin = false;
      this.isSubAdmin = true;
    }
   
  }
}
