import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { HelperService } from '../helper/helper.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {
  httpOptions: any;
  local_user: any
  constructor(private http: HttpClient, private helper: HelperService,
    private sanitizer: DomSanitizer, private storage: StorageService, private router: Router) {
      if(!(Object.keys(this.storage.userDetails).length === 0 && this.storage.userDetails.constructor === Object)) {
      this.local_user = this.storage.userDetails;
      }
     }


  setHeader() {
      this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
}
setHeaderWithToken() {
  const jsonString = localStorage?.getItem('mystic9834!@');

  if (jsonString !== null) {
    try {
        const data = JSON.parse(jsonString);
        return {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + data?.access_token
          })
        };
    } catch (error) {
      return {}; // Return empty headers
    }
} else {
  return {}; // Return empty headers
}
}

  get(path: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http.get(environment.apiURL + '/' + path, httpOptions).subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }
  delete(path: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http.delete(environment.apiURL + '/' + path, httpOptions).subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }
  deleteWithData(path: any, data: any) {
    return new Promise((resolve, reject) => {
      const jsonString = localStorage?.getItem('mystic9834!@');
      let user_data : any = null
      if(jsonString != null) {
        user_data = JSON.parse(jsonString);
      }
       const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + user_data?.access_token
        }),
        body: {
          reason: data?.reason,
          description: data?.description
        }
      }
      this.http.delete(environment.apiURL + '/' + path, options).subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }
  postDataLogin(end_point: any, data: any) {
    return new Promise((resolve, reject) => {
      this.setHeader();
      this.http
        .post(environment.apiURL + '/' + end_point, data, this.httpOptions)
        .subscribe({
          next: (data) => {
            resolve(data)
          },
          error: (error) => {
            if(error?.status === 401) {
              localStorage.clear();
              this.storage.removeUserDetails();
              this.router.navigateByUrl('/auth/login');
              return;
            }
            reject(error)
            
          }
        });
    });
  }
  postData(end_point: any, data: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http
        .post(environment.apiURL + '/' + end_point, data, httpOptions)
        .subscribe({
          next: (data) => {
            resolve(data)
          },
          error: (error) => {
            if(error?.status === 401) {
              localStorage.clear();
              this.storage.removeUserDetails();
              this.router.navigateByUrl('/auth/login');
              return;
            }
            reject(error)
            
          }
        });
    });
  }
  postImageData(end_point: any, data: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http
      .post(environment.apiURL + '/' + end_point, data, httpOptions)
      .subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }

  post(path: any, data: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http.post(environment.apiURL + '/' + path, data, httpOptions).subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }

  patch(path: any, unique: any, data: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http.patch(environment.apiURL + '/' + path + unique, data, httpOptions)
      .subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }

  patchWithoutData(path: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http.patch(environment.apiURL + '/' + path, null, httpOptions)
      .subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }

  put(path: any,data: any) {
    return new Promise((resolve, reject) => {
      const httpOptions = this.setHeaderWithToken()
      this.http.put(environment.apiURL + '/' + path, data, httpOptions).subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            localStorage.clear();
            this.storage.removeUserDetails();
            this.router.navigateByUrl('/auth/login');
            return;
          }
          reject(error)
          
        }
      });
    });
  }



  getReport(path: any) {

    return new Promise((resolve, reject) => {
      const options = { responseType: 'blob' as 'json' };
      this.http.get<Blob>(environment.apiURL + '/' + path, options)
      .subscribe({
        next: (data) => {
          resolve(data)
        },
        error: (error) => {
          if(error?.status === 401) {
            this.storage.removeUserDetails();
            this.router.navigate(['/auth/login']);
            return;
          }
          reject(error)
          
        }
      });
    });
  }

}
