import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { AuthService } from '../../../services/auth/auth.service';
declare var $: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  spinnerTitle = '';

  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private auth: AuthService) {

  }

  async ngOnInit() {

    this.spinnerTitle = 'Fetching Data';
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
      this.helper.infoToast('First Name is required');
      return;
    }
    if ($('#lastName').val() == '' || $('#lastName').val() == undefined) {
      this.helper.infoToast('Last Name is required');
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
    this.spinnerTitle = "Updating Profile"
    this.sp.show()
    this.api.patch('Admin/' + storageUser?._id, data)
      .then(async (response: any) => {
        setTimeout(() => {
          this.sp.hide()
          this.helper.successToast('Profile Updated Successfully');
        }, 1000);

      }, err => {
        this.sp.hide();
      });
  }
}
