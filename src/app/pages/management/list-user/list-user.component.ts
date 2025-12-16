import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
  filteredUsers : any = [];
  selectedFilter = 'all';
  selectedStatusFilter = '';
  examId = null;
  permissions: string[] = [];
  lastActionUserId: string | null = null;
  lastActionType: string | null = null;

  // Filter options
  filterOptions = [
    { value: 'all', label: 'LIST.ALL_USERS' },
    { value: 'admin', label: 'LIST.ADMIN' },
    { value: 'subadmin', label: 'LIST.SUB_ADMIN' },
    { value: 'user', label: 'LIST.USERS' },
    { value: 'family', label: 'LIST.FAMILY' },
    { value: 'partner', label: 'LIST.PARTNER' }
  ];

  // Your available permissions
  permissionList = [
    { id: 'perm1', label: 'SIDEBAR.QUESTS' },
    { id: 'perm2', label: 'SIDEBAR.MISSIONS' },
    { id: 'perm3', label: 'SIDEBAR.TREASURE_HUNT' },
    { id: 'perm4', label: 'SIDEBAR.MYSTERIES' },
    { id: 'perm5', label: 'SIDEBAR.DROPS' },
    { id: 'perm6', label: 'COMMON.ALL' }
  ];


  constructor(
    private sp: NgxSpinnerService, 
    private api: RestApiService, 
    private helper: HelperService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }
  async ngOnInit() {
    this.sp.show()
    await this.getAllUsers();
    await this.getAllAnalytics()
    setTimeout(() => {
      $('#dtable').removeClass('dataTable');
      this.initializeTooltips();
    }, 1000);
  }

  async getAllUsers() {
    return new Promise<void>((resolve, reject) => {
      this.sp.show();
      
      this.api.get('user/get_all_admin')
      .then((response: any) => {
          // Temporarily clear filteredUsers to force table re-render
          const tempFiltered = this.filteredUsers;
          this.filteredUsers = [];
          this.cdr.detectChanges();
          
          // Now update with new data
          if (response?.data && Array.isArray(response.data)) {
            this.allUsers = response.data;
          } else {
            this.allUsers = this.allUsers || [];
          }
          
          // Apply filter
          this.applyFilter();
          
          // Force change detection
          this.cdr.detectChanges();
          
          // Remove dataTable class after a short delay
          setTimeout(() => {
            $('#dtable').removeClass('dataTable');
          }, 100);
          
          this.sp.hide();
          
          // Reinitialize tooltips
          setTimeout(() => {
            this.initializeTooltips();
          }, 300);
          
          resolve();
      }).catch((error: any) => {
        this.sp.hide();
        console.error('Error loading users:', error);
        if (this.allUsers.length === 0) {
          this.helper.failureToast('Failed to load users. Please refresh the page.');
        }
        reject(error);
      });
    });
  }

  initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl: any) => {
      // Destroy existing tooltip if any
      const existingTooltip = (window as any).bootstrap.Tooltip.getInstance(tooltipTriggerEl);
      if (existingTooltip) {
        existingTooltip.dispose();
      }
      // Create new tooltip
      new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  applyFilter() {
    // Check if we have data to filter
    if (!this.allUsers || this.allUsers.length === 0) {
      this.filteredUsers = [];
      this.cdr.detectChanges();
      return;
    }
    
    // Start with a FRESH copy of all users
    let filtered = [...this.allUsers];
    
    // Apply type filter - primarily check 'type' field, with fallbacks
    if (this.selectedFilter === 'all') {
      // Keep all users - no filtering needed
    } else if (this.selectedFilter === 'user') {
      // Regular users (not partner, not family, not admin, not subadmin)
      filtered = filtered.filter((user: any) => {
        const userType = user.type || user.user_type || '';
        const userRole = user.user_role || '';
        
        const isUser = userType === 'user' && 
                       userType !== 'admin' && 
                       userType !== 'subadmin' &&
                       userType !== 'partner' &&
                       userType !== 'family' &&
                       userRole !== 'admin' &&
                       userRole !== 'subadmin' &&
                       userRole !== 'partner' &&
                       userRole !== 'family';
        return isUser;
      });
    } else if (this.selectedFilter === 'family') {
      filtered = filtered.filter((user: any) => {
        const userType = user.type || user.user_type || '';
        const userRole = user.user_role || '';
        const isFamily = userType === 'family' || userRole === 'family';
        return isFamily;
      });
    } else if (this.selectedFilter === 'partner') {
      filtered = filtered.filter((user: any) => {
        const userType = user.type || user.user_type || '';
        const userRole = user.user_role || '';
        const isPartner = userType === 'partner' || userRole === 'partner';
        return isPartner;
      });
    } else if (this.selectedFilter === 'admin') {
      filtered = filtered.filter((user: any) => {
        const userType = user.type || user.user_type || '';
        const userRole = user.user_role || '';
        const isAdmin = userType === 'admin' || userRole === 'admin';
        return isAdmin;
      });
    } else if (this.selectedFilter === 'subadmin') {
      filtered = filtered.filter((user: any) => {
        const userType = user.type || user.user_type || '';
        const userRole = user.user_role || '';
        const isSubAdmin = userType === 'subadmin' || userRole === 'subadmin';
        return isSubAdmin;
      });
    } else {
      // Generic fallback
      filtered = filtered.filter((user: any) => {
        const userType = user.type || user.user_type || '';
        const userRole = user.user_role || '';
        const matches = userType === this.selectedFilter || userRole === this.selectedFilter;
        return matches;
      });
    }
    
    // Apply status filter
    if (this.selectedStatusFilter) {
      const beforeStatusFilter = filtered.length;
      if (this.selectedStatusFilter === 'pending') {
        filtered = filtered.filter((user: any) => {
          const isPending = user.approval_status === 'pending' || 
                           user.status === 'pending';
          return isPending;
        });
      } else if (this.selectedStatusFilter === 'blocked') {
        // Check both status and approval_status for blocked
        filtered = filtered.filter((user: any) => {
          const isBlocked = user.status === 'blocked' || 
                            user.approval_status === 'blocked' ||
                            user.approval_status === 'rejected';
          return isBlocked;
        });
      } else {
        filtered = filtered.filter((user: any) => {
          // For active, make sure it's not blocked or rejected
          const matchesStatus = user.status === this.selectedStatusFilter && 
                               user.approval_status !== 'blocked' &&
                               user.approval_status !== 'rejected';
          return matchesStatus;
        });
      }
    }
    
    // CRITICAL FIX: Force table refresh by temporarily clearing and restoring
    // This forces Angular DataTables to re-render
    this.filteredUsers = [];
    this.cdr.detectChanges();
    
    // Use setTimeout to ensure Angular processes the empty array first
    setTimeout(() => {
      this.filteredUsers = filtered || [];
      this.cdr.detectChanges();
      
      // Force DataTables refresh
      setTimeout(() => {
        const tableElement = document.getElementById('dtable');
        if (tableElement) {
          // Remove dataTable class to force re-initialization
          $(tableElement).removeClass('dataTable');
          
          // Force another change detection after removing class
          this.cdr.detectChanges();
        }
      }, 50);
    }, 10);
    
  }

  applyStatusFilter() {
    // Ensure we have data before filtering
    if (!this.allUsers || this.allUsers.length === 0) {
      this.getAllUsers().then(() => {
        this.applyFilter();
      });
    } else {
      this.applyFilter();
    }
  }

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    // Ensure we have data before filtering
    if (!this.allUsers || this.allUsers.length === 0) {
      this.getAllUsers().then(() => {
        this.applyFilter();
      });
    } else {
      this.applyFilter();
    }
  }

  async getAllAnalytics() {
    // Don't clear allUsers here - it's used by the filter
    // this.allUsers = []; // Remove this line if it exists
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
      title: this.translate.instant('POPUPS.DELETE_USER_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
      this.sp.show();
        this.api.delete('user/'+userId)
        .then((response: any) => {
          this.sp.hide();
          Swal.fire(this.translate.instant('COMMON.USER'), this.translate.instant('MESSAGES.DELETED_SUCCESS'), "success");
          // Refresh data immediately
          this.getAllUsers();
          this.getAllAnalytics();
        }, err => {
          this.helper.failureToast(err?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_DELETE_USER'));
          this.sp.hide();
        });
      } else if (result.isDenied) {
       // Swal.fire("Exam not deleted", "", "info");
      }
    });
  }
  blockUser(userId: any, status: any){
    const statusText = status === 'block' ? this.translate.instant('COMMON.BLOCK') : this.translate.instant('COMMON.UNBLOCK');
    Swal.fire({
      title: this.translate.instant('POPUPS.BLOCK_USER_TITLE', { status: statusText }),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.YES'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
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
        this.api.patch('user/'+userId, d)
        .then((response: any) => {
          // Show success message
          Swal.fire(this.translate.instant('COMMON.USER'), this.translate.instant('MESSAGES.UPDATED_SUCCESS'), "success");
          
          // Refresh data - don't hide spinner, let getAllUsers handle it
          this.getAllUsers().then(() => {
            this.getAllAnalytics();
            // Reinitialize tooltips after update
            setTimeout(() => {
              this.initializeTooltips();
            }, 500);
          });
        }, err => {
          this.sp.hide();
          this.helper.failureToast(err?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_UPDATE_USER'));
        });
      } else if (result.isDenied) {
       // Swal.fire("Exam not deleted", "", "info");
      }
    });
  }
  saveRequest(){
    const email = $('#email').val()?.toString().trim() || '';
    const password = $('#password').val()?.toString().trim() || '';
    const username = $('#username').val()?.toString().trim() || '';
    const allowedQuestInput = $('#allowed_quest').val();
    const allowedHuntInput = $('#allowed_hunt').val();
    
    // Parse numbers and handle edge cases
    const allowedQuest = parseInt(allowedQuestInput?.toString() || '0', 10);
    const allowedHunt = parseInt(allowedHuntInput?.toString() || '0', 10);
    
    // Email validation
    if(!email || email === ''){
      Swal.fire(this.translate.instant('COMMON.EMAIL'), this.translate.instant('VALIDATION.EMAIL_REQUIRED'), "error");
      $('#email').focus();
      return;
    }
    if(email.length > 100){
      Swal.fire(this.translate.instant('COMMON.EMAIL'), this.translate.instant('VALIDATION.EMAIL_MAX', { max: 100 }), "error");
      $('#email').focus();
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      Swal.fire(this.translate.instant('COMMON.EMAIL'), this.translate.instant('VALIDATION.EMAIL_INVALID'), "error");
      $('#email').focus();
      return;
    }
    
    // Password validation
    if(!password || password === ''){
      Swal.fire(this.translate.instant('COMMON.PASSWORD'), this.translate.instant('VALIDATION.PASSWORD_REQUIRED'), "error");
      $('#password').focus();
      return;
    }
    if(password.length < 6){
      Swal.fire(this.translate.instant('COMMON.PASSWORD'), this.translate.instant('VALIDATION.PASSWORD_MIN', { min: 6 }), "error");
      $('#password').focus();
      return;
    }
    if(password.length > 50){
      Swal.fire(this.translate.instant('COMMON.PASSWORD'), this.translate.instant('VALIDATION.PASSWORD_MAX', { max: 50 }), "error");
      $('#password').focus();
      return;
    }
    
    // Username validation
    if(!username || username === ''){
      Swal.fire(this.translate.instant('COMMON.USERNAME'), this.translate.instant('VALIDATION.USERNAME_REQUIRED'), "error");
      $('#username').focus();
      return;
    }
    if(username.length < 3){
      Swal.fire(this.translate.instant('COMMON.USERNAME'), this.translate.instant('VALIDATION.USERNAME_MIN', { min: 3 }), "error");
      $('#username').focus();
      return;
    }
    if(username.length > 50){
      Swal.fire(this.translate.instant('COMMON.USERNAME'), this.translate.instant('VALIDATION.USERNAME_MAX', { max: 50 }), "error");
      $('#username').focus();
      return;
    }
    // Username should only contain alphanumeric and underscore
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if(!usernameRegex.test(username)){
      Swal.fire(this.translate.instant('COMMON.USERNAME'), this.translate.instant('VALIDATION.USERNAME_PATTERN'), "error");
      $('#username').focus();
      return;
    }
    
    // Allowed Quest validation - must be positive integer >= 1
    if(isNaN(allowedQuest) || allowedQuest < 1 || !Number.isInteger(allowedQuest)){
      Swal.fire(this.translate.instant('SIDEBAR.DIGITAL_QUESTS'), this.translate.instant('VALIDATION.ALLOWED_QUESTS_POSITIVE'), "error");
      $('#allowed_quest').focus();
      return;
    }
    
    // Allowed Hunt validation - must be positive integer >= 1
    if(isNaN(allowedHunt) || allowedHunt < 1 || !Number.isInteger(allowedHunt)){
      Swal.fire(this.translate.instant('SIDEBAR.TREASURE_HUNTS'), this.translate.instant('VALIDATION.ALLOWED_HUNTS_POSITIVE'), "error");
      $('#allowed_hunt').focus();
      return;
    }
    
    if(this.permissions.length < 1){
      Swal.fire(this.translate.instant('FORMS.PERMISSIONS'), this.translate.instant('VALIDATION.AT_LEAST_ONE_PERMISSION'), "error");
      return;
    }
   let data = {
    email: email,
    password: password,
    username: username,
    image: " ",
    allowed_quest: allowedQuest,
    allowed_hunt: allowedHunt,
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
            // Clear form fields
            $('#email').val('');
            $('#password').val('');
            $('#username').val('');
            $('#allowed_quest').val('1');
            $('#allowed_hunt').val('1');
            this.helper.successToast("Sub Admin Created Successfully");
          }, 1000);
          
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire(this.translate.instant('COMMON.SUB_ADMIN'), error?.error?.message || this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }
  showRewardDialog(){
    $("#addProfession").modal("show");
    // Reset form fields with default values
    $('#email').val('');
    $('#password').val('');
    $('#username').val('');
    $('#allowed_quest').val('1');  // Set default to 1 instead of 0
    $('#allowed_hunt').val('1');   // Set default to 1 instead of 0
    // Reset permissions
    this.resetPermissionForm();
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

  approveUser(userId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.APPROVE_USER_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.APPROVE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateApprovalStatus(userId, 'approved');
      }
    });
  }

  rejectUser(userId: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.REJECT_USER_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.REJECT'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateApprovalStatus(userId, 'rejected');
      }
    });
  }

  updateApprovalStatus(userId: any, status: string) {
    this.sp.show();
    const data = {
      approval_status: status
    };
    this.api.post(`user/partner/${userId}/approval-status`, data)
      .then((response: any) => {
        this.sp.hide();
        const statusText = status === 'approved' ? this.translate.instant('COMMON.APPROVED') : this.translate.instant('COMMON.REJECTED');
        Swal.fire(this.translate.instant('COMMON.USER'), `${statusText} ${this.translate.instant('MESSAGES.SUCCESS')}`, "success");
        this.lastActionUserId = userId;
        this.lastActionType = status;
        this.getAllUsers();
        this.getAllAnalytics();
        setTimeout(() => {
          this.lastActionUserId = null;
          this.lastActionType = null;
        }, 3000);
      }, err => {
        this.helper.failureToast(err?.error?.message);
        this.sp.hide();
      });
  }
  
  trackByUserId(index: number, user: any): any {
    return user.id || user._id || index;
  }

  preventNegativeInput(event: KeyboardEvent) {
    // Prevent minus sign, plus sign (for negative), and 'e' (scientific notation)
    const invalidKeys = ['-', '+', 'e', 'E', '.'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validateNumberInput(event: any, fieldId: string) {
    const input = event.target;
    let value = input.value;
    
    // Remove any negative signs
    if (value.includes('-')) {
      value = value.replace(/-/g, '');
    }
    
    // Convert to number
    const numValue = parseInt(value, 10);
    
    // If invalid, empty, or less than 1, set to 1
    if (isNaN(numValue) || value === '' || numValue < 1) {
      input.value = 1;
    } else {
      // Ensure it's a whole number (no decimals)
      input.value = Math.floor(numValue);
    }
  }
}

