import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-exploring-spot',
  templateUrl: './list-exploring-spot.component.html',
  styleUrl: './list-exploring-spot.component.scss'
})
export class ListExploringSpotComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };
  allSpots: any = [];
  cityFilter = '';
  tableKey = 0;

  constructor(
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService,
    private router: Router,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.getAll();
  }

  getAll() {
    this.sp.show();
    const city = (this.cityFilter || '').trim();
    const path = city
      ? 'exploringSpot/all?city=' + encodeURIComponent(city)
      : 'exploringSpot/all';
    this.api.get(path)
      .then((response: any) => {
        this.sp.hide();
        this.allSpots = response?.data || [];
        this.tableKey += 1;
      })
      .catch(() => {
        this.sp.hide();
      });
  }

  clearCityFilter() {
    this.cityFilter = '';
    this.getAll();
  }

  edit(id: string) {
    this.router.navigate(['/management/edit-exploring-spot'], { queryParams: { spotId: id } });
  }

  deletee(id: string) {
    Swal.fire({
      title: this.translate.instant('COMMON.DELETE'),
      text: this.translate.instant('EXPLORING_SPOTS.DELETE_CONFIRM'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      cancelButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete('exploringSpot/delete/' + id)
          .then(() => {
            this.sp.hide();
            Swal.fire(this.translate.instant('EXPLORING_SPOTS.TITLE'), this.translate.instant('EXPLORING_SPOTS.DELETED'), "success");
            this.getAll();
          }, () => {
            this.sp.hide();
            this.helper.failureToast(this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'));
          });
      }
    });
  }
}
