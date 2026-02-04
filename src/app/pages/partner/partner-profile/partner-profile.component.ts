import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PartnerProfileService, UpdatePartnerProfileBody } from '../../../services/partner-profile/partner-profile.service';
import { AuthService } from '../../../services/auth/auth.service';
import { HelperService } from '../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-partner-profile',
  templateUrl: './partner-profile.component.html',
  styleUrls: ['./partner-profile.component.scss']
})
export class PartnerProfileComponent implements OnInit {
  profile: any = null;
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
  galleryFileInput: HTMLInputElement | null = null;
  backgroundFileInput: HTMLInputElement | null = null;

  constructor(
    private spinner: NgxSpinnerService,
    private partnerProfileService: PartnerProfileService,
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
      const pp = data?.partner_profile || {};
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

  private parseNumber(v: number | null | undefined): number | null {
    if (v == null) return null;
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isNaN(n) ? null : n;
  }
}
