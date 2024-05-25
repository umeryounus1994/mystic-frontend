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
  skills : any = [];
  skill1 : any;
  skill2 : any;
  skill3 : any;
  skill4 : any;
  creatureId: any;
  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    private auth: AuthService) {

  }

  async ngOnInit() {

    this.spinnerTitle = 'Fetching Data';
    this.sp.show();
    await this.getSingleUser();
    this.getAllSKills()
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
  async getAllSKills() {
    this.api.get('skill/get_all')
      .then((response: any) => {
        this.skills = response?.data
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

  editMythicaModal(m: any){
    $("#editMythica").modal('show');
    $("#creature_element1").val(m?.creature_element)
    $("#creature_description1").val(m?.creature_description)
    $("#creature_gender1").val(m?.creature_gender)
    $("#creature_height1").val(m?.creature_height)
    $("#creature_name1").val(m?.creature_name)
    $("#creature_rarity1").val(m?.creature_rarity)
    $("#creature_weight1").val(m?.creature_weight)
    $("#creature_skill1").val(m?.creature_skill1?._id)
    $("#creature_skill2").val(m?.creature_skill2?._id)
    $("#creature_skill3").val(m?.creature_skill3?._id)
    $("#creature_skill4").val(m?.creature_skill4?._id)
    this.creatureId = m?._id;
  }
  updateMythica() {
    if ($('#creature_element1').val() == '' || $('#creature_element1').val() == undefined) {
      this.helper.infoToast('Element is required');
      return;
    }
    if ($('#creature_gender1').val() == '' || $('#creature_gender1').val() == undefined) {
      this.helper.infoToast('Gender is required');
      return;
    }
    if ($('#creature_height1').val() == '' || $('#creature_height1').val() == undefined) {
      this.helper.infoToast('Height is required');
      return;
    }
    if ($('#creature_name1').val() == '' || $('#creature_name1').val() == undefined) {
      this.helper.infoToast('Name is required');
      return;
    }
    if ($('#creature_skill1').val() == '' || $('#creature_skill1').val() == undefined) {
      this.helper.infoToast('Skill1 is required');
      return;
    }
    if ($('#creature_skill2').val() == '' || $('#creature_skill2').val() == undefined) {
      this.helper.infoToast('Skill2 is required');
      return;
    }
    const data = {
      creature_element: $('#creature_element1').val(),
      creature_description: $('#creature_description1').val(),
      creature_gender: $('#creature_gender1').val(),
      creature_height: $('#creature_height1').val(),
      creature_name: $('#creature_name1').val(),
      creature_rarity: $('#creature_rarity1').val(),
      creature_weight: $('#creature_weight1').val(),
      creature_skill1: $('#creature_skill1').val(),
      creature_skill2: $('#creature_skill2').val(),
      creature_skill3: $('#creature_skill3').val(),
      creature_skill4: $('#creature_skill4').val(),
      creature_food: $('#creature_food').val(),
    };
    this.sp.show()
    this.api.patch('creature/'+ this.creatureId, data)
      .then(async (response: any) => {
        this.sp.hide()
        $('#editMythica').modal('hide');
        this.helper.successToast('Mythica updated Successfully');
        this.getSingleUser();
      }, err => {
        this.helper.failureToast(err?.error?.message);
        this.sp.hide();
      });
  }
}
