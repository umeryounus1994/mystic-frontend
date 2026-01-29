import { Injectable } from '@angular/core';
import { RestApiService } from '../api/rest-api.service';

@Injectable({
  providedIn: 'root'
})
export class CommissionRateService {
  constructor(private api: RestApiService) {}

  /**
   * Admin API:
   * GET /api/v1/commission-rate/
   */
  getCommissionRate() {
    return this.api.get('commission-rate');
  }

  /**
   * Admin API:
   * PUT /api/v1/commission-rate/ { rate: number }
   */
  updateCommissionRate(rate: number) {
    return this.api.put('commission-rate', { rate });
  }
}

