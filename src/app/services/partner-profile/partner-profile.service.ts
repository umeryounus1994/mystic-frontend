import { Injectable } from '@angular/core';
import { RestApiService } from '../api/rest-api.service';

export interface MapLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface LayoutOptions {
  background?: string; // URL or #hex
}

export interface UpdatePartnerProfileBody {
  about?: string;
  gallery?: string[];
  map_location?: MapLocation;
  layout_options?: LayoutOptions;
}

@Injectable({
  providedIn: 'root'
})
export class PartnerProfileService {
  constructor(private api: RestApiService) {}

  /**
   * GET /api/v1/user/partner/profile
   * Partner-only. Returns full partner profile (about, gallery, map_location, layout_options, etc.)
   */
  getProfile() {
    return this.api.get('user/partner/profile');
  }

  /**
   * GET /api/v1/user/partner/:id/profile
   * Admin only. Returns a partner's profile (about, gallery, layout_options, etc.) for preview.
   */
  getProfileByPartnerId(partnerId: string) {
    return this.api.get(`user/partner/${partnerId}/profile`);
  }

  /**
   * GET /api/v1/user/partner/:partnerId/profile-with-activities
   * Returns partner profile and their activities (for public/view partner page).
   */
  getProfileWithActivities(partnerId: string) {
    return this.api.get(`user/partner/${partnerId}/profile-with-activities`);
  }

  /**
   * PATCH /api/v1/user/partner/profile
   * Send only fields to update: about, gallery, map_location, layout_options
   */
  updateProfile(body: UpdatePartnerProfileBody) {
    return this.api.patch('user/partner/profile', body);
  }

  /**
   * POST /api/v1/user/partner/profile/gallery (multipart)
   * Field name: gallery. Up to 20 files. Appends to existing gallery.
   */
  uploadGalleryImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('gallery', file, file.name));
    return this.api.postImageData('user/partner/profile/gallery', formData);
  }

  /**
   * POST /api/v1/user/partner/profile/background (multipart)
   * Field name: background. Single file.
   */
  uploadBackgroundImage(file: File) {
    const formData = new FormData();
    formData.append('background', file, file.name);
    return this.api.postImageData('user/partner/profile/background', formData);
  }
}
