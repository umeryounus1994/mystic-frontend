import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-quest-group',
  templateUrl: './edit-quest-group.component.html',
  styleUrl: './edit-quest-group.component.scss'
})
export class EditQuestGroupComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  reward: File | undefined = undefined;
  groupId = "";
  existingRewardFile = "";

  constructor(
    private api: RestApiService,
    private sp: NgxSpinnerService,
    private helper: HelperService,
    public router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && Object.keys(params).length > 0) {
        this.groupId = params['groupId'] || params['Id'];
      }
    });
  }

  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }

  ngOnInit() {
    this.questForm = this.fb.group({
      quest_group_name: ['', [Validators.required, Validators.minLength(5)]],
      no_of_crypes: ['', Validators.required],
      group_package: ['', Validators.required],
      qr_code: ['']
    });
    if (this.groupId) {
      this.loadGroup();
    }
  }

  get f() { return this.questForm?.controls; }

  loadGroup() {
    this.sp.show();
    this.api.get('quest/get_quest_group/' + this.groupId)
      .then((response: any) => {
        this.sp.hide();
        const g = response?.data;
        this.QrCode = g?.qr_code || '';
        this.existingRewardFile = g?.reward_file || '';
        this.questForm.patchValue({
          quest_group_name: g?.quest_group_name,
          no_of_crypes: g?.no_of_crypes,
          group_package: g?.group_package,
          qr_code: g?.qr_code
        });
      })
      .catch(() => {
        this.sp.hide();
        Swal.fire(this.translate.instant('QUEST_GROUP.QUEST_GROUP'), this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }

  onSubmit() {
    this.submitted = true;
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    }
  }

  _sendSaveRequest(formData: any) {
    this.sp.show();
    const fD = new FormData();
    fD.append('quest_group_name', formData?.quest_group_name);
    fD.append('group_package', formData?.group_package);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('qr_code', formData?.qr_code);
    if (this.reward) {
      fD.append('reward', this.reward!, this.reward?.name);
    }
    this.api.postImageData('quest/editQuestGroup/' + this.groupId, fD)
      .then(() => {
        this.sp.hide();
        setTimeout(() => {
          this.helper.successToast(this.translate.instant('QUEST_GROUP.UPDATED_SUCCESSFULLY'));
        }, 500);
        setTimeout(() => {
          this.router.navigate(['quest/list-quest-group']);
        }, 1200);
      })
      .catch(() => {
        this.sp.hide();
        Swal.fire(this.translate.instant('QUEST_GROUP.QUEST_GROUP'), this.translate.instant('MESSAGES.ERROR_TRY_AGAIN'), "error");
      });
  }

  onFileSelected(event: any, type: string) {
    if (type == 'reward') {
      this.reward = event.target.files[0];
    }
  }
}
