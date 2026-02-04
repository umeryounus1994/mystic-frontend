import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { CommissionRateService } from '../../../services/commission-rate/commission-rate.service';
import { PartnerProfileService } from '../../../services/partner-profile/partner-profile.service';
import { AuthService } from '../../../services/auth/auth.service';
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

  // Set partner commission (admin only)
  selectedPartnerForCommission: any = null;
  commissionRateInput: number | null = null;
  savingCommission = false;

  // View partner profile (about, gallery, background)
  selectedPartnerForView: any = null;
  partnerProfileView: any = null;
  loadingProfileView = false;
  partnerProfileViewError: string | null = null;

  // Filter options
  filterOptions = [
    { value: 'all', label: 'LIST.ALL_USERS' },
    { value: 'admin', label: 'LIST.ADMIN' },
    { value: 'subadmin', label: 'LIST.SUB_ADMIN' },
    { value: 'user', label: 'LIST.USERS' },
    { value: 'family', label: 'LIST.FAMILY' },
    { value: 'partner', label: 'LIST.PARTNER' }
  ];

  // Permissions: label = translation key, value = string sent to backend (must match sidebar permission checks)
  permissionList = [
    { id: 'perm1', label: 'SIDEBAR.DIGITAL_QUESTS', value: 'Quest' },
    { id: 'perm2', label: 'SIDEBAR.MISSIONS', value: 'Missions' },
    { id: 'perm3', label: 'SIDEBAR.TREASURE_HUNTS', value: 'Hunts' },
    { id: 'perm4', label: 'SIDEBAR.PICTURE_MYSTERIES', value: 'Picture Mysteries' },
    { id: 'perm5', label: 'SIDEBAR.DROPS', value: 'Drops' },
    { id: 'perm6', label: 'SIDEBAR.SKY_DROPPED_GIFTS', value: 'Sky Gifts' },
    { id: 'perm7', label: 'SIDEBAR.BOOKINGS', value: 'Bookings' },
    { id: 'perm8', label: 'SIDEBAR.USERS', value: 'Users' },
    { id: 'perm9', label: 'SIDEBAR.MYTHICAS', value: 'Mythicas' },
    { id: 'perm10', label: 'SIDEBAR.PAYOUTS_MANAGEMENT', value: 'Payouts Management' },
    { id: 'perm11', label: 'SIDEBAR.COMMISSION_RATE', value: 'Commission Rate' },
    { id: 'perm12', label: 'COMMON.ALL', value: 'All' }
  ];


  constructor(
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService,
    private commissionRateService: CommissionRateService,
    private partnerProfileService: PartnerProfileService,
    private auth: AuthService,
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
        this.permissions = ['All'];
        this.permissionList.forEach(p => {
          if (p.value !== 'All') {
            const el = document.getElementById(p.id) as HTMLInputElement;
            if (el) el.checked = false;
          }
        });
      } else {
        this.permissions = [];
      }
    } else {
      if (input.checked) {
        this.permissions = this.permissions.filter(p => p !== 'All');
        if (!this.permissions.includes(value)) {
          this.permissions.push(value);
        }
        const allPerm = this.permissionList.find(p => p.value === 'All');
        if (allPerm) {
          const allCheckbox = document.getElementById(allPerm.id) as HTMLInputElement;
          if (allCheckbox) allCheckbox.checked = false;
        }
      } else {
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

  get canSetPartnerCommission(): boolean {
    return !!(this.auth.isAdmin || this.auth.user?.permissions?.includes('Commission Rate') || this.auth.user?.permissions?.includes('All'));
  }

  isPartner(user: any): boolean {
    const t = user?.type || user?.user_type || user?.user_role || '';
    return t === 'partner';
  }

  getPartnerId(user: any): string {
    return user?._id || user?.id || '';
  }

  getPartnerCommissionRate(user: any): number | null {
    // API may return commission_rate at top level (get_all_admin) or under partner_profile
    const rate = user?.commission_rate ?? user?.partner_profile?.commission_rate;
    if (typeof rate === 'number' && !Number.isNaN(rate)) return rate;
    const n = parseFloat(String(rate));
    return !Number.isNaN(n) ? n : null;
  }

  openSetCommissionModal(user: any) {
    this.selectedPartnerForCommission = user;
    this.commissionRateInput = this.getPartnerCommissionRate(user) ?? 15;
    this.cdr.detectChanges();
    $('#setCommissionModal').modal('show');
  }

  closeSetCommissionModal() {
    this.selectedPartnerForCommission = null;
    this.commissionRateInput = null;
    $('#setCommissionModal').modal('hide');
    this.cdr.detectChanges();
  }

  openViewPartnerProfile(user: any) {
    const partnerId = this.getPartnerId(user);
    if (!partnerId) {
      this.helper.failureToast('Invalid partner');
      return;
    }
    this.selectedPartnerForView = user;
    this.partnerProfileView = null;
    this.partnerProfileViewError = null;
    this.loadingProfileView = true;
    this.cdr.detectChanges();
    $('#viewPartnerProfileModal').modal('show');
    this.partnerProfileService.getProfileByPartnerId(partnerId)
      .then((res: any) => {
        this.partnerProfileView = res?.data || res;
        this.loadingProfileView = false;
        this.cdr.detectChanges();
      })
      .catch((err: any) => {
        this.loadingProfileView = false;
        this.partnerProfileViewError = err?.error?.message || err?.message || 'Failed to load profile';
        this.cdr.detectChanges();
      });
  }

  closeViewPartnerProfile() {
    this.selectedPartnerForView = null;
    this.partnerProfileView = null;
    this.partnerProfileViewError = null;
    $('#viewPartnerProfileModal').modal('hide');
    this.cdr.detectChanges();
  }

  getPartnerProfileAbout(): string {
    const pp = this.partnerProfileView?.partner_profile;
    const about = pp?.about;
    return about != null && String(about).trim() !== '' ? String(about).trim() : '';
  }

  getPartnerProfileGallery(): string[] {
    const pp = this.partnerProfileView?.partner_profile;
    const g = pp?.gallery;
    return Array.isArray(g) ? g : [];
  }

  getPartnerProfileBackground(): string {
    const pp = this.partnerProfileView?.partner_profile;
    const bg = pp?.layout_options?.background;
    if (bg == null || String(bg).trim() === '') return '';
    return String(bg).trim();
  }

  getPartnerProfileBackgroundStyle(): { [key: string]: string } {
    const bg = this.getPartnerProfileBackground();
    if (!bg) return {};
    if (bg.startsWith('#') || bg.startsWith('rgb')) return { 'background-color': bg };
    return { 'background-image': `url(${bg})`, 'background-size': 'cover', 'background-position': 'center' };
  }

  getPartnerProfilePP(): any {
    return this.partnerProfileView?.partner_profile || {};
  }

  getPartnerProfileBusinessName(): string {
    const v = this.getPartnerProfilePP().business_name;
    return v != null && String(v).trim() !== '' ? String(v).trim() : '—';
  }

  getPartnerProfileBusinessDescription(): string {
    const v = this.getPartnerProfilePP().business_description;
    return v != null && String(v).trim() !== '' ? String(v).trim() : '—';
  }

  getPartnerProfilePhone(): string {
    const v = this.getPartnerProfilePP().phone;
    return v != null && String(v).trim() !== '' ? String(v).trim() : '—';
  }

  getPartnerProfileMapCoordinates(): string {
    const coords = this.getPartnerProfilePP().map_location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return '—';
    return `${coords[0]}, ${coords[1]}`;
  }

  getPartnerProfileCommissionRate(): number | null {
    const r = this.getPartnerProfilePP().commission_rate;
    if (typeof r === 'number' && !Number.isNaN(r)) return r;
    const n = parseFloat(String(r));
    return !Number.isNaN(n) ? n : null;
  }

  getPartnerProfileApprovalStatus(): string {
    const v = this.getPartnerProfilePP().approval_status;
    return v != null && String(v).trim() !== '' ? String(v).trim() : '—';
  }

  getPartnerProfileEmail(): string {
    const v = this.partnerProfileView?.email;
    return v != null && String(v).trim() !== '' ? String(v).trim() : '—';
  }

  getPartnerProfileCreatedAt(): string {
    const v = this.partnerProfileView?.created_at;
    return v != null ? String(v) : '—';
  }

  async savePartnerCommission() {
    if (!this.selectedPartnerForCommission) return;
    const partnerId = this.getPartnerId(this.selectedPartnerForCommission);
    if (!partnerId) {
      this.helper.failureToast('Invalid partner');
      return;
    }
    const raw = this.commissionRateInput;
    const rate = typeof raw === 'number' ? raw : parseFloat(String(raw));
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      this.helper.warningToast(this.translate.instant('VALIDATION.COMMISSION_RATE_RANGE') || 'Commission rate must be between 0 and 100');
      return;
    }
    this.savingCommission = true;
    this.cdr.detectChanges();
    try {
      const res: any = await this.commissionRateService.setPartnerCommissionRate(partnerId, rate);
      this.helper.successToast(res?.message || this.translate.instant('MESSAGES.UPDATED_SUCCESS') || 'Commission rate updated');
      this.closeSetCommissionModal();
      await this.getAllUsers();
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || this.translate.instant('MESSAGES.FAILED_TO_UPDATE_USER'));
    } finally {
      this.savingCommission = false;
      this.cdr.detectChanges();
    }
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

