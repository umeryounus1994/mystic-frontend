import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { AuthService } from '../../../services/auth/auth.service';
declare var $: any;

@Component({
  selector: 'app-list-player-map-content',
  templateUrl: './list-player-map-content.component.html',
  styleUrl: './list-player-map-content.component.scss'
})
export class ListPlayerMapContentComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false,
    pageLength: 10,
    language: {
      search: ''
    }
  };

  allItems: any[] = [];
  filteredItems: any[] = [];
  selectedItem: any = {};
  usernameSearch = '';

  constructor(
    private sp: NgxSpinnerService,
    private api: RestApiService,
    private helper: HelperService,
    public auth: AuthService,
    public translate: TranslateService
  ) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async ngOnInit() {
    this.sp.show();
    await this.loadItems();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
    }, 1000);
  }

  async loadItems() {
    this.allItems = [];
    this.filteredItems = [];
    this.api.get('mysteryBag/admin/player-map-content')
      .then((response: any) => {
        this.sp.hide();
        this.allItems = response?.data?.items || [];
        this.applyUsernameFilter();
      })
      .catch(() => {
        this.sp.hide();
      });
  }

  applyUsernameFilter() {
    const q = (this.usernameSearch || '').trim().toLowerCase();
    if (!q) {
      this.filteredItems = [...this.allItems];
      return;
    }
    this.filteredItems = this.allItems.filter((item: any) =>
      (item?.created_by?.username || '').toLowerCase().includes(q)
    );
  }

  clearSearch() {
    this.usernameSearch = '';
    this.applyUsernameFilter();
  }

  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  getContentTypeLabelKey(contentType: string): string {
    switch (contentType) {
      case 'magic_art_view':
        return 'PLAYER_MAP_CONTENT.TYPE_MAGIC_ART_VIEW';
      case 'magic_art_collect':
        return 'PLAYER_MAP_CONTENT.TYPE_MAGIC_ART_COLLECT';
      case 'map_bag_old':
        return 'PLAYER_MAP_CONTENT.TYPE_MAP_BAG_OLD';
      default:
        return 'PLAYER_MAP_CONTENT.TYPE_OTHER';
    }
  }

  viewItem(item: any) {
    this.selectedItem = item;
    $('#viewPlayerMapContent').modal('show');
  }

  deleteItem(item: any) {
    Swal.fire({
      title: this.translate.instant('POPUPS.DELETE_PLAYER_MAP_CONTENT_TITLE'),
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('COMMON.DELETE'),
      denyButtonText: this.translate.instant('COMMON.CANCEL')
    }).then((result) => {
      if (result.isConfirmed) {
        this.sp.show();
        this.api.delete('mysteryBag/admin/player-map-content/' + item.id)
          .then(() => {
            this.sp.hide();
            Swal.fire(
              this.translate.instant('SIDEBAR.PLAYER_MAP_CONTENT'),
              this.translate.instant('MESSAGES.DELETED_SUCCESS'),
              'success'
            );
            this.loadItems();
          })
          .catch((err: any) => {
            this.helper.failureToast(err?.error?.message);
            this.sp.hide();
          });
      }
    });
  }
}
