import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PartnerProfileService, UpdatePartnerProfileBody } from '../../../services/partner-profile/partner-profile.service';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { RestApiService } from '../../../services/api/rest-api.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-partner-profile',
  templateUrl: './partner-profile.component.html',
  styleUrls: ['./partner-profile.component.scss']
})
export class PartnerProfileComponent implements OnInit {
  profile: any = null;
  profileImageUrl: string | null = null; // current profile picture URL
  email = '';
  phone = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  updatingAccount = false;
  changingPassword = false;
  slug = '';
  about = '';
  gallery: string[] = [];
  longitude: number | null = null;
  latitude: number | null = null;
  backgroundValue = ''; // URL or #hex
  galleryUrlsText = ''; // temporary edit for gallery URLs (one per line)
  loading = false;
  saving = false;
  uploadingGallery = false;
  uploadingBackground = false;
  uploadingImage = false;
  galleryFileInput: HTMLInputElement | null = null;
  backgroundFileInput: HTMLInputElement | null = null;

  constructor(
    private spinner: NgxSpinnerService,
    private partnerProfileService: PartnerProfileService,
    private api: RestApiService,
    private auth: AuthService,
    private helper: HelperService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.loading = true;
    this.spinner.show();
    try {
      const res: any = await this.partnerProfileService.getProfile();
      const data = res?.data;
      this.profile = data;
      this.profileImageUrl = data?.image || this.auth.user?.image || null;
      this.email = data?.email || this.auth.user?.email || '';
      this.slug = data?.slug ?? this.auth.user?.slug ?? '';
      const pp = data?.partner_profile || {};
      this.phone = pp.phone || this.auth.user?.partner_profile?.phone || '';
      this.about = pp.about || '';
      this.gallery = Array.isArray(pp.gallery) ? [...pp.gallery] : [];
      this.galleryUrlsText = this.gallery.join('\n');
      const coords = pp.map_location?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        this.longitude = coords[0];
        this.latitude = coords[1];
      } else {
        this.longitude = null;
        this.latitude = null;
      }
      this.backgroundValue = pp.layout_options?.background || '';
      // Optionally sync to auth user for other components
      if (this.auth.user && data) {
        this.auth.user.partner_profile = this.auth.user.partner_profile || {};
        Object.assign(this.auth.user.partner_profile, pp);
      }
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to load profile');
    } finally {
      this.loading = false;
      this.spinner.hide();
    }
  }

  async saveProfile(): Promise<void> {
    const body: UpdatePartnerProfileBody = {};
    const currentSlug = this.profile?.slug ?? this.auth.user?.slug ?? '';
    if (this.slug.trim() !== currentSlug) body.slug = this.slug.trim();
    if (this.about !== (this.profile?.partner_profile?.about || '')) body.about = this.about;
    const lng = this.parseNumber(this.longitude);
    const lat = this.parseNumber(this.latitude);
    const hasMap = lng !== null && lat !== null && !Number.isNaN(lng) && !Number.isNaN(lat);
    if (hasMap) {
      body.map_location = { type: 'Point', coordinates: [lng, lat] };
    }
    if (this.backgroundValue !== (this.profile?.partner_profile?.layout_options?.background || '')) {
      body.layout_options = { background: this.backgroundValue };
    }
    const newGallery = this.galleryUrlsText.trim() ? this.galleryUrlsText.split('\n').map(s => s.trim()).filter(Boolean) : [];
    const sameGallery = newGallery.length === this.gallery.length && newGallery.every((u, i) => u === this.gallery[i]);
    if (!sameGallery) body.gallery = newGallery;

    if (Object.keys(body).length === 0) {
      this.helper.infoToast(this.translate.instant('PROFILE.NO_CHANGES') || 'No changes to save');
      return;
    }

    this.saving = true;
    this.spinner.show();
    try {
      const res: any = await this.partnerProfileService.updateProfile(body);
      const data = res?.data;
      if (data) {
        this.profile = data;
        if (body.slug !== undefined && data.slug != null) {
          this.slug = data.slug;
          if (this.auth.user) this.auth.user.slug = data.slug;
        }
        const pp = data.partner_profile || {};
        if (body.about !== undefined) this.about = pp.about ?? body.about;
        if (body.gallery) this.gallery = Array.isArray(pp.gallery) ? pp.gallery : body.gallery;
        if (body.gallery) this.galleryUrlsText = this.gallery.join('\n');
        if (body.layout_options?.background !== undefined) this.backgroundValue = pp.layout_options?.background ?? body.layout_options?.background ?? '';
        if (body.map_location && pp.map_location?.coordinates?.length >= 2) {
          this.longitude = pp.map_location.coordinates[0];
          this.latitude = pp.map_location.coordinates[1];
        }
      }
      this.helper.successToast(res?.message || this.translate.instant('PROFILE.UPDATED_SUCCESSFULLY') || 'Profile updated');
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to update profile');
    } finally {
      this.saving = false;
      this.spinner.hide();
    }
  }

  triggerProfileImageUpload(): void {
    const el = document.getElementById('profileImageFileInput') as HTMLInputElement;
    if (el) {
      el.value = '';
      el.click();
    }
  }

  async onProfileImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.uploadingImage = true;
    this.spinner.show();
    try {
      const res: any = await this.partnerProfileService.uploadProfileImage(file);
      const url = res?.data?.image;
      if (url) {
        this.profileImageUrl = url;
        if (this.profile) this.profile.image = url;
        if (this.auth.user) this.auth.user.image = url;
      }
      this.helper.successToast(res?.message || this.translate.instant('PARTNER_PROFILE.PROFILE_IMAGE_UPDATED'));
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to upload profile image');
    } finally {
      this.uploadingImage = false;
      this.spinner.hide();
      input.value = '';
    }
  }

  triggerGalleryUpload(): void {
    const el = document.getElementById('galleryFileInput') as HTMLInputElement;
    if (el) {
      el.value = '';
      el.click();
    }
  }

  triggerBackgroundUpload(): void {
    const el = document.getElementById('backgroundFileInput') as HTMLInputElement;
    if (el) {
      el.value = '';
      el.click();
    }
  }

  async onGalleryFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input?.files;
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).slice(0, 20);
    this.uploadingGallery = true;
    this.spinner.show();
    try {
      const res: any = await this.partnerProfileService.uploadGalleryImages(fileList);
      const newGallery = res?.data?.gallery;
      if (Array.isArray(newGallery)) {
        this.gallery = newGallery;
        this.galleryUrlsText = this.gallery.join('\n');
      }
      this.helper.successToast(res?.message || 'Gallery images added');
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to upload gallery images');
    } finally {
      this.uploadingGallery = false;
      this.spinner.hide();
      input.value = '';
    }
  }

  async onBackgroundFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.uploadingBackground = true;
    this.spinner.show();
    try {
      const res: any = await this.partnerProfileService.uploadBackgroundImage(file);
      const url = res?.data?.layout_options?.background;
      if (url) {
        this.backgroundValue = url;
      }
      this.helper.successToast(res?.message || 'Background updated');
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to upload background');
    } finally {
      this.uploadingBackground = false;
      this.spinner.hide();
      input.value = '';
    }
  }

  async updateAccountDetails(): Promise<void> {
    const email = (this.email || '').trim();
    const phone = (this.phone || '').trim();

    const currentEmail = this.profile?.email || this.auth.user?.email || '';
    const currentPhone = this.profile?.partner_profile?.phone || this.auth.user?.partner_profile?.phone || '';

    if (email === currentEmail && phone === currentPhone) {
      this.helper.infoToast(this.translate.instant('PROFILE.NO_CHANGES') || 'No changes to save');
      return;
    }

    if (!email) {
      this.helper.infoToast(this.translate.instant('VALIDATION.EMAIL_REQUIRED') || 'Email is required');
      return;
    }

    const payload: any = {
      email,
      partner_profile: { phone }
    };

    const partnerId = this.auth.user?._id || this.profile?._id;
    if (!partnerId) {
      this.helper.failureToast(this.translate.instant('MESSAGES.FAILED_TO_UPDATE_PROFILE'));
      return;
    }

    this.updatingAccount = true;
    this.spinner.show();
    try {
      const res: any = await this.api.patch('user/partner/' + partnerId, payload);
      const data = res?.data;
      if (data) {
        this.profile = { ...this.profile, ...data };
        this.email = data.email || email;
        this.phone = data?.partner_profile?.phone ?? phone;
        if (this.auth.user) {
          this.auth.user.email = this.email;
          this.auth.user.partner_profile = this.auth.user.partner_profile || {};
          this.auth.user.partner_profile.phone = this.phone;
        }
      }
      this.helper.successToast(res?.message || this.translate.instant('PROFILE.UPDATED_SUCCESSFULLY'));
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to update account details');
    } finally {
      this.updatingAccount = false;
      this.spinner.hide();
    }
  }

  async changePassword(): Promise<void> {
    const current = (this.currentPassword || '').trim();
    const next = (this.newPassword || '').trim();
    const confirm = (this.confirmPassword || '').trim();

    if (!current || !next || !confirm) {
      this.helper.infoToast(this.translate.instant('VALIDATION.REQUIRED') || 'All fields are required');
      return;
    }

    if (next.length < 6) {
      this.helper.infoToast(this.translate.instant('VALIDATION.PASSWORD_MIN') || 'Password must be at least 6 characters');
      return;
    }

    if (next !== confirm) {
      this.helper.infoToast(this.translate.instant('VALIDATION.CONFIRM_PASSWORD') || 'Passwords do not match');
      return;
    }

    this.changingPassword = true;
    this.spinner.show();
    try {
      const payload = {
        password: current,
        password_confirmation: next
      };
      const res: any = await this.api.post('user/partner/change-password', payload);
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.helper.successToast(res?.message || this.translate.instant('AUTH.RESET_PASSWORD') || 'Password updated successfully');
      setTimeout(() => {
        this.helper.infoToast(this.translate.instant('AUTH.SIGN_IN_INSTEAD') || 'Please login again');
        this.auth.logout();
      }, 1500);
    } catch (err: any) {
      this.helper.failureToast(err?.error?.message || err?.message || 'Failed to change password');
    } finally {
      this.changingPassword = false;
      this.spinner.hide();
    }
  }

  private parseNumber(v: number | null | undefined): number | null {
    if (v == null) return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isNaN(n) ? null : n;
  }
}
