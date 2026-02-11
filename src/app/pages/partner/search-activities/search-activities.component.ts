import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-activities',
  templateUrl: './search-activities.component.html',
  styleUrl: './search-activities.component.scss'
})
export class SearchActivitiesComponent implements OnInit {
  Math = Math;
  
  activities: any[] = [];
  categories = [
    { value: '', label: 'SEARCH_ACTIVITIES.ALL_CATEGORIES' },
    { value: 'outdoor', label: 'SEARCH_ACTIVITIES.OUTDOOR' },
    { value: 'indoor', label: 'SEARCH_ACTIVITIES.INDOOR' },
    { value: 'educational', label: 'SEARCH_ACTIVITIES.EDUCATIONAL' },
    { value: 'sports', label: 'SEARCH_ACTIVITIES.SPORTS' },
    { value: 'arts', label: 'SEARCH_ACTIVITIES.ARTS' },
    { value: 'adventure', label: 'SEARCH_ACTIVITIES.ADVENTURE' },
    { value: 'others', label: 'SEARCH_ACTIVITIES.OTHERS' }
  ];

  filters = {
    page: 1,
    limit: 12,
    category: '',
    date: '',
    latitude: '',
    longitude: '',
    radius: 10,
    search: '',
    min_price: '',
    max_price: ''
  };

  pagination = {
    current_page: 1,
    total_pages: 1,
    total_items: 0
  };

  locationLoading = false;

  constructor(
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService,
    public router: Router,
    public translate: TranslateService
  ) {}

  async ngOnInit() {
    this.sp.show();
    await this.searchActivities();
  }

  async searchActivities() {
    this.activities = [];
    
    const queryParams = new URLSearchParams();
    Object.keys(this.filters).forEach(key => {
      const value = this.filters[key as keyof typeof this.filters];
      if (value !== '' && value !== null && value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `activity/search-activities?${queryParams.toString()}`;
    
    try {
      const response: any = await this.api.get(endpoint);
      this.sp.hide();
      this.activities = response?.data?.activities || [];
      this.pagination = response?.data?.pagination || this.pagination;
    } catch (error: any) {
      this.sp.hide();
      this.helper.failureToast(error?.error?.message || this.translate.instant('MESSAGES.FAILED_TO_LOAD_ACTIVITIES'));
    }
  }

  onFilterChange() {
    this.sp.show();
    this.filters.page = 1;
    this.searchActivities();
  }

  onPageChange(page: number) {
    this.sp.show();
    this.filters.page = page;
    this.sp.show();
    this.searchActivities();
  }

  clearFilters() {
    this.sp.show();
    this.filters = {
      page: 1,
      limit: 12,
      category: '',
      date: '',
      latitude: '',
      longitude: '',
      radius: 10,
      search: '',
      min_price: '',
      max_price: ''
    };
    this.searchActivities();
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      this.locationLoading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.filters.latitude = position.coords.latitude.toString();
          this.filters.longitude = position.coords.longitude.toString();
          this.locationLoading = false;
          this.helper.successToast(this.translate.instant('SEARCH_ACTIVITIES.LOCATION_UPDATED'));
        },
        (error) => {
          this.locationLoading = false;
          this.helper.failureToast(this.translate.instant('SEARCH_ACTIVITIES.UNABLE_TO_GET_LOCATION'));
        }
      );
    } else {
      this.helper.failureToast(this.translate.instant('SEARCH_ACTIVITIES.GEOLOCATION_NOT_SUPPORTED'));
    }
  }

  viewActivity(activity: any) {
    this.router.navigate(['/partner/view-activity'], { queryParams: { activityId: activity._id } });
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'outdoor': return 'bi-tree';
      case 'indoor': return 'bi-house';
      case 'educational': return 'bi-book';
      case 'sports': return 'bi-trophy';
      case 'arts': return 'bi-palette';
      case 'adventure': return 'bi-compass';
      case 'others': return 'bi-tag';
      default: return 'bi-tag';
    }
  }
}
