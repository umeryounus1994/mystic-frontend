import { Component, OnInit } from '@angular/core';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { AuthService } from '../../../services/auth/auth.service';
declare var $: any;

@Component({
  selector: 'app-mythicas',
  templateUrl: './mythicas.component.html',
  styleUrl: './mythicas.component.scss'
})
export class MythicasComponent implements OnInit {
  spinnerTitle = '';
  mythicas : any = [];
  skill1 : any;
  skill2 : any;
  skill3 : any;
  skill4 : any;
  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private auth: AuthService) {

  }

  async ngOnInit() {

    this.spinnerTitle = 'Fetching Data';
    this.sp.show();
    await this.getSingleUser();
    setTimeout(() => {
      this.sp.hide();
    }, 1000);

  }
  async getSingleUser() {
      this.api.get('admin/get_mythicas')
        .then((response: any) => {
          this.mythicas = response?.data
        }).catch((error: any) => {
        });
  }
  showDetails(m: any){
    $("#viewQuest").modal('show');
    $("#creature_element").html(m?.creature_element)
    $("#creature_description").html(m?.creature_description)
    $("#creature_gender").html(m?.creature_gender)
    $("#creature_height").html(m?.creature_height)
    $("#creature_name").html(m?.creature_name)
    $("#creature_rarity").html(m?.creature_rarity)
    $("#creature_weight").html(m?.creature_weight)
    this.skill1 = m?.creature_skill1?.skill_name
    this.skill2 = m?.creature_skill2?.skill_name
    this.skill3 = m?.creature_skill3?.skill_name
    this.skill4 = m?.creature_skill4?.skill_name
  }
}
