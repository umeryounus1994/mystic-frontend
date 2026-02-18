import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { PartnerProfileService } from '../../../services/partner-profile/partner-profile.service';
import { HelperService } from '../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-partner-profile',
  templateUrl: './view-partner-profile.component.html',
  styleUrls: ['./view-partner-profile.component.scss']
})
export class ViewPartnerProfileComponent implements OnInit {
  partnerId: string | null = null;
  partner: any = null;
  activities: any[] = [];
  loading = false;
  error: string | null = null;
  /** Activity IDs whose first image failed to load - show placeholder instead */
  activityImageFailed = new Set<string>();
  partnerImageFailed = false;
  /** Gallery image URLs that failed to load - hide or show placeholder */
  galleryFailed = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private partnerProfileService: PartnerProfileService,
    private helper: HelperService,
    public translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.partnerId = params['partnerId'] || null;
      if (this.partnerId) {
        this.loadProfileWithActivities();
      } else {
        this.error = 'Partner ID is required';
      }
    });
  }

  async loadProfileWithActivities(): Promise<void> {
    if (!this.partnerId) return;
    this.loading = true;
    this.error = null;
    this.spinner.show();
    try {
      const res: any = await this.partnerProfileService.getProfileWithActivities(this.partnerId);
      const data = res?.data;
      if (data) {
        this.partner = data.partner || null;
        this.activities = Array.isArray(data.activities) ? data.activities : [];
      } else {
        this.error = this.translate.instant('MESSAGES.FAILED_TO_LOAD_ACTIVITY') || 'Failed to load profile';
      }
    } catch (err: any) {
      this.error = err?.error?.message || err?.message || this.translate.instant('MESSAGES.FAILED_TO_LOAD_ACTIVITY');
      this.helper.failureToast(this.error);
    } finally {
      this.loading = false;
      this.spinner.hide();
    }
  }

  getProfile(): any {
    return this.partner?.partner_profile || {};
  }

  getMapGoogleUrl(): string | null {
    const coords = this.getProfile()?.map_location?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return `https://www.google.com/maps?q=${coords[1]},${coords[0]}`;
    }
    return null;
  }

  getGallery(): string[] {
    const g = this.getProfile()?.gallery;
    return Array.isArray(g) ? g : [];
  }

  /** True if activity has a valid first image URL (non-empty string). */
  getActivityImageUrl(act: any): string | null {
    const url = act?.images?.[0];
    return url && typeof url === 'string' && url.trim() !== '' ? url.trim() : null;
  }

  onActivityImageError(activityId: string): void {
    this.activityImageFailed.add(activityId);
    this.cdr.detectChanges();
  }

  onPartnerImageError(): void {
    this.partnerImageFailed = true;
    this.cdr.detectChanges();
  }

  onGalleryImageError(index: number): void {
    this.galleryFailed.add(index);
    this.cdr.detectChanges();
  }

  viewActivity(activityId: string): void {
    this.router.navigate(['/partner/view-activity'], { queryParams: { activityId } });
  }

  goBack(): void {
    window.history.back();
  }
}
