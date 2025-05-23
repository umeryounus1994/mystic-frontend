import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-list-user',
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.scss'
})
export class ListUserComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };
  counters = {
    users: 0,
    active: 0,
    inactive: 0
  }

  allUsers : any = [];
  examId = null;
  permissions: string[] = [];

  // Your available permissions
  permissionList = [
    { id: 'perm1', label: 'Quest' },
    { id: 'perm2', label: 'Missions' },
    { id: 'perm3', label: 'Hunts' },
    { id: 'perm4', label: 'Picture Mysteries' },
    { id: 'perm5', label: 'Drops' },
    { id: 'perm6', label: 'All' }
  ];


  constructor(private sp: NgxSpinnerService, private api: RestApiService, private helper: HelperService,
    private router: Router) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }
  async ngOnInit() {
    this.sp.show()
    await this.getAllUsers();
    await this.getAllAnalytics()
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  async getAllUsers() {
    this.allUsers = [];
    this.api.get('user/get_all_admin')
    .then((response: any) => {
        this.sp.hide();
        this.allUsers = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }

  async getAllAnalytics() {
    this.allUsers = [];
    this.api.get('user/user_analytics')
    .then((response: any) => {
        this.sp.hide();
        this.counters = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }
  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  deleteExamModal(userId: any) {
    Swal.fire({
      title: "Are you sure You want to delete this User?",
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Delete",
      denyButtonText: `Cancel`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {

      this.sp.show();
        this.api.delete('User/'+userId)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("User!", "Deleted Successfully", "success");
         this.getAllUsers()
         this.getAllAnalytics()
        }, err => {
          this.helper.failureToast(err?.error?.message);
          this.sp.hide();
        });
      } else if (result.isDenied) {
       // Swal.fire("Exam not deleted", "", "info");
      }
    });
  }
  blockUser(userId: any, status: any){
    Swal.fire({
      title: `Are you sure You want to ${status} this User?`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Yes",
      denyButtonText: `Cancel`
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let d :any;
        if(status == 'block'){
          d = {
            status: 'blocked'
          }
        } else {
          d = {
            status: 'active'
          }
        }
      this.sp.show();
        this.api.patch('User/'+userId, d)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire("User!", "Updated Successfully", "success");
         this.getAllUsers()
         this.getAllAnalytics()
        }, err => {
          this.helper.failureToast(err?.error?.message);
          this.sp.hide();
        });
      } else if (result.isDenied) {
       // Swal.fire("Exam not deleted", "", "info");
      }
    });
  }
  saveRequest(){
    if($('#email').val() == '' || $('#email').val() == undefined){
      Swal.fire("Email!", "Email is required", "error");
      return;
    }
    if($('#password').val() == '' || $('#password').val() == undefined){
      Swal.fire("Password!", "Password is required", "error");
      return;
    }
    if($('#username').val() == '' || $('#username').val() == undefined){
      Swal.fire("Username!", "Username is required", "error");
      return;
    }
    if($('#allowed_quest').val() == '' || $('#allowed_quest').val() == undefined){
      Swal.fire("Quest!", "No of Quest is required", "error");
      return;
    }
    if($('#allowed_hunt').val() == '' || $('#allowed_hunt').val() == undefined){
      Swal.fire("Hunt!", "No of Hunt is required", "error");
      return;
    }
    if(this.permissions.length < 1){
      Swal.fire("Hunt!", "Permissions is required", "error");
      return;
    }
   let data = {
    email: $('#email').val(),
    password: $('#password').val(),
    username: $('#username').val(),
    image: " ",
    allowed_quest: $('#allowed_quest').val(),
    allowed_hunt: $('#allowed_hunt').val(),
    user_type: "subadmin",
    permissions: this.permissions
   }
    this.sp.show();
    this.api.post('user/signup_subadmin', data)
      .then((response: any) => {
          this.sp.hide();
          
          setTimeout(() => {
            $("#addProfession").modal("hide");
            this.getAllUsers()
            this.getAllAnalytics()
            this.resetPermissionForm();
            this.helper.successToast("Sub Admin Created Successfully");
          }, 1000);
          
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Sub Admin!", "There is an error, please try again", "error");
      });
  }
  showRewardDialog(){
    $("#addProfession").modal("show");
    $('#email').val('')
    $('#password').val('')
    $('#username').val('')
    $('#image').val('')
    $('#allowed_quest').val('')
    $('#allowed_hunt').val('')
  }
  onPermissionChange(event: Event) {
   
    const input = event.target as HTMLInputElement;
    const value = input.value;
  
    if (value === 'All') {
      if (input.checked) {
        // If 'All' is selected, clear other permissions and keep only 'All'
        this.permissions = ['All'];
  
        // Uncheck other checkboxes in the DOM manually
        this.permissionList.forEach(p => {
          if (p.label !== 'All') {
            const el = document.getElementById(p.id) as HTMLInputElement;
            if (el) el.checked = false;
          }
        });
      } else {
        // If 'All' is deselected, clear permissions
        this.permissions = [];
      }
    } else {
      if (input.checked) {
        // Remove 'All' if it's currently selected
        this.permissions = this.permissions.filter(p => p !== 'All');
  
        // Add the new permission if not already present
        if (!this.permissions.includes(value)) {
          this.permissions.push(value);
        }
  
        // Uncheck 'All' checkbox if needed
        const allCheckbox = document.getElementById('perm6') as HTMLInputElement;
        if (allCheckbox) allCheckbox.checked = false;
      } else {
        // Remove permission on uncheck
        this.permissions = this.permissions.filter(p => p !== value);
      }
    }
  }
  resetPermissionForm() {
    // Clear selected permissions
    this.permissions = [];
  
    // Uncheck all checkboxes in the DOM
    this.permissionList.forEach(p => {
      const checkbox = document.getElementById(p.id) as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    });
  }
  
}
