import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-edit-quest',
  templateUrl: './edit-quest.component.html',
  styleUrl: './edit-quest.component.scss'
})
export class EditQuestComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  allCreatures: any = [];
  allActivities: any = [];
  reward: File | undefined = undefined;
  Id = '';
  rewardFile = '';
  quest_file: File | undefined = undefined;
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  option5: File | undefined = undefined;
  questimg = '';
  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    public router: Router, private fb: FormBuilder, private route: ActivatedRoute, private auth: AuthService) {
      this.route.queryParams.subscribe(params => {
        if (params && Object.keys(params).length > 0) {
          this.Id = params['Id'];
        }
      });
  }
  ngOnInit() {
    this.questForm = this.fb.group({
      quest_question: ['', [Validators.required, Validators.minLength(5)]],
      quest_title: ['', [Validators.required, Validators.minLength(5)]],
      quest_password: [''], // Add password field
      activity_id: [''], // Add activity field
      quest_context: ['standalone'], // Add context field
      no_of_xp: ['', Validators.required],
      no_of_crypes: ['', Validators.required],
      level_increase: ['', Validators.required],
      mythica_ID: ['', Validators.required],
      quest_type: ['', Validators.required],
      questions: this.fb.array([])
    });
   
    this.getAllCreatures()
    this.getAllActivities() // Add this
    this.getProductDetails()
  }
  getProductDetails() {
    this.sp.show(); // Add spinner at start
    
    this.api.get('quest/get_quest_by_id/' + this.Id)
      .then((response: any) => {
        this.sp.hide();
        if(response?.data?.questQuiz && response?.data?.questQuiz.length < 1){
          this.addQuestion();
        }
        this.questForm.controls['quest_question'].setValue(response?.data?.quest?.quest_question);
        this.questForm.controls['quest_title'].setValue(response?.data?.quest?.quest_title);
        this.questForm.controls['quest_password'].setValue(response?.data?.quest?.quest_password || '');
        // Handle both populated and non-populated activity_id
        const activityId = response?.data?.quest?.activity_id?._id || response?.data?.quest?.activity_id || '';
        this.questForm.controls['activity_id'].setValue(activityId);
        this.questForm.controls['quest_context'].setValue(response?.data?.quest?.quest_context || 'standalone');
        this.questForm.controls['no_of_xp'].setValue(response?.data?.quest?.no_of_xp);
        this.questForm.controls['level_increase'].setValue(response?.data?.quest?.level_increase);
        this.questForm.controls['no_of_crypes'].setValue(response?.data?.quest?.no_of_crypes);
        this.questForm.controls['mythica_ID'].setValue(response?.data?.quest?.mythica_ID?._id);
        this.questForm.controls['quest_type'].setValue(response?.data?.quest?.quest_type || "simple");
        this.rewardFile = response?.data?.quest?.reward_file
        this.questimg = response?.data?.quest?.quest_image
        response?.data?.questQuiz?.forEach((question: any) => {
          this.questions().push(this.fb.group({
            answer: question.answer,
            correct_option: question.correct_option,
            answer_image: question.answer_image || ""
          }));
        });
      })
      .catch((error: any) => {
        this.sp.hide(); // Hide spinner on error
        console.error('Error loading quest details:', error);
      });
  }
  get f() { return this.questForm?.controls; }
  questions() : FormArray {  
    return this.questForm.get("questions") as FormArray  
  }  
  getAllCreatures() {
    this.allCreatures = [];
    this.api.get('creature/get_all')
    .then((response: any) => {
        this.sp.hide();
        this.allCreatures = response?.data;
    }).catch((error: any) => {
      this.sp.hide();
    });
  }
  getAllActivities() {
    this.allActivities = [];
    
    const queryParams = new URLSearchParams();
    queryParams.append('status', 'approved');
    queryParams.append('page', '1');
    queryParams.append('limit', '100');

    // Add partner_id only if user is a partner
    if (this.auth.isPartner) {
      queryParams.append('partner_id', this.auth.user._id.toString());
    }

    const endpoint = `activity/?${queryParams.toString()}`;
    
    this.api.get(endpoint)
      .then((response: any) => {
        this.allActivities = response?.data?.activities || [];
      }).catch((error: any) => {
        console.error('Error loading activities:', error);
      });
  }
  onActivityChange(event: any) {
    const activityId = event.target.value;
    if (activityId) {
      this.questForm.patchValue({ quest_context: 'activity_linked' });
    } else {
      this.questForm.patchValue({ quest_context: 'standalone' });
    }
  }
  newQuestion(): FormGroup {  
    return this.fb.group({  
      answer: '',  
      answer_image: '',
      correct_option: false,  
      quest_id: ''
    })  
  }     
  addQuestion() {  
    this.questions().push(this.newQuestion());  
  }  
  removeQuestion(i:number) {  
    this.questions().removeAt(i);  
  } 
  onSubmit(){
    this.submitted = true;
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    }
  }
  _sendSaveRequest(formData: any) {
    this.sp.show();
    let questions = formData.questions;
    const fD = new FormData();
    fD.append('quest_question', formData?.quest_question);
    fD.append('quest_title', formData?.quest_title);
    if(formData?.quest_password) {
      fD.append('quest_password', formData?.quest_password);
    }
    if(formData?.activity_id) {
      fD.append('activity_id', formData?.activity_id);
    }
    fD.append('quest_context', formData?.quest_context);
    fD.append('no_of_xp', formData?.no_of_xp);
    fD.append('no_of_crypes', formData?.no_of_crypes);
    fD.append('level_increase', formData?.level_increase);
    fD.append('mythica_ID', formData?.mythica_ID);
    fD.append('quest_type', formData?.quest_type);
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }
    if(this.option1){
      fD.append('option1', this.option1!, this.option1?.name);
    }
    if(this.option2){
      fD.append('option2', this.option2!, this.option2?.name);
    }
    if(this.option3){
      fD.append('option3', this.option3!, this.option3?.name);
    }
    if(this.option4){
      fD.append('option4', this.option4!, this.option4?.name);
    }
    if(this.option5){
      fD.append('option5', this.option5!, this.option5?.name);
    }
    if(this.quest_file){
      fD.append('quest_file', this.quest_file!, this.quest_file?.name);
    }
    fD.append('questions', JSON.stringify(formData.questions));
    this.api.postImageData('quest/updateQuest/'+this.Id, fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Quest Updated Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['quest/list-quest']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        // Don't logout on non-401 errors
        if (error?.status === 401) {
          // Session expired - handleUnauthorized will handle logout
          return;
        }
        const errorMessage = error?.error?.message || error?.error?.error || 'There is an error, please try again';
        Swal.fire("Quest!", errorMessage, "error");
      });
  }
  onFileSelected(event: any, type: string) {
    if(type == 'reward'){
      this.reward = event.target.files[0];
    }
  }
  onFileSelectedQuest(event: any) {
    this.quest_file = event.target.files[0];
}
onFileSelectedOptions(event: any, type: string) {
  if(type == 'option1'){
    this.option1 = event.target.files[0];
  }
  if(type == 'option2'){
    this.option2 = event.target.files[0];
  }
  if(type == 'option3'){
    this.option3 = event.target.files[0];
  }
  if(type == 'option4'){
    this.option4 = event.target.files[0];
  } 
  if(type == 'option5'){
    this.option5 = event.target.files[0];
  } 
}
}
