import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestApiService } from '../../../services/api/rest-api.service';
import { HelperService } from '../../../services/helper/helper.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
declare var $: any;

@Component({
  selector: 'app-list-quest-group',
  templateUrl: './list-quest-group.component.html',
  styleUrl: './list-quest-group.component.scss'
})
export class ListQuestGroupComponent implements OnInit {
  dtOptions: any = {
    pagingType: 'numbers',
    ordering: false
  };
  counters = {
    quests: 0,
    active: 0,
    deleted: 0
  }

  allQuests : any = [];
  examId = null;
  questions : any = [];
  qrCode: any = 'Hello';
  mythicaURL = '';
  mythicaModel = '';

  /** Quests returned for the group opened in the modal */
  groupQuests: any[] = [];
  groupQuestsMessage = '';
  selectedGroupName = '';

  constructor(private sp: NgxSpinnerService, private api: RestApiService, private helper: HelperService,
    private router: Router, public auth: AuthService, private translate: TranslateService) {
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }
  ngOnInit() {
    this.sp.show()
      this.getAllUsers();
    setTimeout(function () {
      $('#dtable').removeClass('dataTable');
  }, 1000);
  }

  getAllUsers() {
    this.allQuests = [];
    this.api.get('quest/get_all_quest_groups')
    .then((response: any) => {
        this.sp.hide();
        this.allQuests = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }
  getFormatedDate(date: any) {
    return this.helper.getReportFormatedDateYMD(date);
  }

  getQuestGroupId(group: any): string | undefined {
    if (!group) {
      return undefined;
    }
    const id = group.id ?? group._id;
    return id != null ? String(id) : undefined;
  }

  viewQuestsInGroup(group: any) {
    const gid = this.getQuestGroupId(group);
    if (!gid) {
      Swal.fire(
        this.translate.instant('MESSAGES.ERROR'),
        this.translate.instant('QUEST_GROUP.INVALID_GROUP'),
        'error'
      );
      return;
    }
    this.selectedGroupName = group.quest_group_name ?? '';
    this.groupQuests = [];
    this.groupQuestsMessage = '';
    this.sp.show();
    this.api
      .get(`quest/get_quests_by_group/${gid}`)
      .then((res: any) => {
        this.sp.hide();
        this.groupQuestsMessage = (res?.message ?? '').toString();
        const data = res?.data;
        const raw = Array.isArray(data) ? data : [];
        this.groupQuests = this.sortQuestsChronological(raw);
        setTimeout(() => {
          $('#viewQuestsInGroup').modal('show');
        }, 0);
      })
      .catch(() => {
        this.sp.hide();
        Swal.fire(
          this.translate.instant('MESSAGES.ERROR'),
          this.translate.instant('QUEST_GROUP.LOAD_QUESTS_FAILED'),
          'error'
        );
      });
  }

  getQuestTitle(quest: any): string {
    const t = quest?.quest_title ?? quest?.title ?? '';
    return t != null ? String(t) : '';
  }

  getQuestType(quest: any): string {
    const t = quest?.quest_type;
    if (t != null && String(t).trim() !== '') {
      return String(t);
    }
    return 'simple';
  }

  /** Oldest first (quest 1 → N), stable tie-breaker by id. */
  sortQuestsChronological(quests: any[]): any[] {
    return [...quests].sort((a, b) => {
      const ta = this.parseQuestDateMs(a?.created_at);
      const tb = this.parseQuestDateMs(b?.created_at);
      if (ta !== tb) {
        return ta - tb;
      }
      const ida = String(a?.id ?? a?._id ?? '');
      const idb = String(b?.id ?? b?._id ?? '');
      return ida.localeCompare(idb);
    });
  }

  private parseQuestDateMs(value: any): number {
    if (value == null || value === '') {
      return Number.MAX_SAFE_INTEGER;
    }
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? Number.MAX_SAFE_INTEGER : ms;
  }

  getGroupNamePreview(group: any): string {
    const n = group?.quest_group_name != null ? String(group.quest_group_name) : '';
    if (n.length <= 40) {
      return n || '—';
    }
    return `${n.substring(0, 40)}…`;
  }

  getQuizEntries(quest: any): any[] {
    const q = quest?.quiz ?? quest?.options ?? quest?.questions ?? quest?.answers;
    return Array.isArray(q) ? q : [];
  }

  hasTextContent(value: any): boolean {
    if (value == null) {
      return false;
    }
    return String(value).trim().length > 0;
  }

  /** Non-empty file / URL string (relative or absolute). */
  hasFileLink(value: any): boolean {
    if (value == null) {
      return false;
    }
    const t = String(value).trim();
    return t.length > 0 && t !== 'undefined' && t !== 'null';
  }

  fileHref(value: any): string {
    return String(value ?? '').trim();
  }

  isVideoFile(value: any): boolean {
    const url = this.fileHref(value).toLowerCase();
    return url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') || url.includes('.m4v');
  }

  isImageFile(value: any): boolean {
    const url = this.fileHref(value).toLowerCase();
    return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp');
  }

  openExternalFile(value: any): void {
    const url = this.fileHref(value);
    if (!url) {
      this.helper.infoToast('File not available');
      return;
    }

    if (this.isAndroidDevice() && this.isPdfFile(url)) {
      window.location.href = url;
      return;
    }

    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  downloadExternalFile(value: any): void {
    const url = this.fileHref(value);
    if (!url) {
      this.helper.infoToast('File not available');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  formatMultiline(value: any): string {
    if (value == null) {
      return '';
    }
    return String(value);
  }

  getMythicaLabel(quest: any): string {
    if (quest?.mythica != null && String(quest.mythica).trim() !== '') {
      return String(quest.mythica).trim();
    }
    if (quest?.mythica_ID?.name) {
      return String(quest.mythica_ID.name);
    }
    return '';
  }

  onImgError(ev: Event): void {
    const el = ev.target as HTMLImageElement | null;
    if (el?.style) {
      el.style.display = 'none';
    }
  }

  private isPdfFile(url: string): boolean {
    return url.toLowerCase().includes('.pdf');
  }

  private isAndroidDevice(): boolean {
    return /android/i.test(navigator.userAgent || '');
  }
}