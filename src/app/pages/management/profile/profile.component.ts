import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  spinnerTitle = '';

  constructor(
    private api: RestApiService, 
    private sp: NgxSpinnerService, 
    private helper: HelperService,
    public router: Router,
    public translate: TranslateService
  ) {

  }

  async ngOnInit() {

    this.spinnerTitle = this.translate.instant('COMMON.FETCHING_DATA');
    this.sp.show();
    await this.getSingleUser();
    setTimeout(() => {
      this.sp.hide();
    }, 1000);

  }
  async getSingleUser() {
    const jsonString = localStorage?.getItem('mystic9834!@');
   
    if (jsonString !== null) {
      const data = JSON.parse(jsonString);
      this.api.get('Admin/')
        .then((response: any) => {
          $("#firstName").val(response?.data?.first_name)
          $("#lastName").val(response?.data?.last_name)
        }).catch((error: any) => {
        });
    }

  }

  onSubmitUserUpdate() {
    if ($('#firstName').val() == '' || $('#firstName').val() == undefined) {
      this.helper.infoToast(this.translate.instant('VALIDATION.FIRST_NAME_REQUIRED'));
      return;
    }
    if ($('#lastName').val() == '' || $('#lastName').val() == undefined) {
      this.helper.infoToast(this.translate.instant('VALIDATION.LAST_NAME_REQUIRED'));
      return;
    }
    let data = null;
    data = {
      first_name: $('#firstName').val(),
      last_name: $('#lastName').val()
    };
    const jsonString = localStorage?.getItem('mystic9834!@');
    let storageUser: any = null;
    if (jsonString !== null) {
      storageUser = JSON.parse(jsonString);
    }
    this.spinnerTitle = this.translate.instant('PROFILE.UPDATING_PROFILE')
    this.sp.show()
    
    // Determine correct endpoint based on user type
    let endpoint = '';
    if (storageUser?.user_type === 'admin') {
      endpoint = 'admin/' + storageUser?._id;
    } else if (storageUser?.user_type === 'partner') {
      endpoint = 'user/partner/' + storageUser?._id;
    } else if (storageUser?.user_type === 'family') {
      endpoint = 'user/family/' + storageUser?._id;
    } else {
      endpoint = 'user/' + storageUser?._id;
    }
    
    this.api.patch(endpoint, data)
      .then(async (response: any) => {
        setTimeout(() => {
          this.sp.hide()
          this.helper.successToast(this.translate.instant('PROFILE.UPDATED_SUCCESSFULLY'));
          // Update local storage with new data
          if (response?.data) {
            localStorage.setItem('mystic9834!@', JSON.stringify(response.data));
          }
        }, 1000);

      }, err => {
        this.sp.hide();
        // Don't logout on non-401 errors
        if (err?.status === 401) {
          // Session expired - handleUnauthorized will handle logout
          return;
        }
        this.helper.failureToast(err?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_UPDATE_PROFILE'));
      });
  }

  goBack() {
    // Navigate back to dashboard or previous page
    this.router.navigate(['dashboard/admin']); // or use location.back() for browser history
  }
}
