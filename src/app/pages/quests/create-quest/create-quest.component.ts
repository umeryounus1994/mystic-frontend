import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestApiService } from '../../../services/api/rest-api.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { HelperService } from '../../../services/helper/helper.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-create-quest',
  templateUrl: './create-quest.component.html',
  styleUrl: './create-quest.component.scss'
})
export class CreateQuestComponent implements OnInit {
  questForm: FormGroup | any;
  submitted = false;
  public QrCode: string = "";
  public qrCodeDownloadLink: SafeUrl = "";
  allCreatures: any = [];
  allActivities: any = [];
  reward: File | undefined = undefined;
  quest_file: File | undefined = undefined;
  option1: File | undefined = undefined;
  option2: File | undefined = undefined;
  option3: File | undefined = undefined;
  option4: File | undefined = undefined;
  option5: File | undefined = undefined;
  constructor(private api: RestApiService, private sp: NgxSpinnerService, private helper: HelperService,
    public router: Router, private fb: FormBuilder, public auth: AuthService, private cdr: ChangeDetectorRef) {
      this.QrCode = Math.floor(new Date().valueOf() * Math.random()).toString()+(new Date().getTime()).toString(36);
  }
  onChangeURL(url: SafeUrl) {
    this.qrCodeDownloadLink = url;
  }
  ngOnInit() {
    if(this.auth.isAdmin){
      this.questForm = this.fb.group({
        quest_question: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
        quest_title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        quest_password: [''], // Optional password field
        activity_id: [''], // Optional activity link
        quest_context: ['standalone'], // Default to standalone
        no_of_xp: [1, [Validators.required, Validators.min(1)]], // Changed from 0 to 1
        no_of_crypes: [0, [Validators.required, Validators.min(0)]],
        level_increase: [0, [Validators.required, Validators.min(0)]],
        mythica_ID: ['', Validators.required],
        quest_type: ['', Validators.required],
        qr_code: [this.QrCode],
        questions: this.fb.array([])
      });
    } else {
      this.questForm = this.fb.group({
        quest_question: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
        quest_title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
        quest_password: [''], // Optional password field
        activity_id: [''], // Add this line
        quest_context: ['standalone'], // Add this line
        no_of_xp: [1, [Validators.min(1)]], // Changed from 0 to 1
        no_of_crypes: [0, [Validators.min(0)]],
        level_increase: [0, [Validators.required, Validators.min(0)]],
        mythica_ID: ['', Validators.required],
        qr_code: [this.QrCode],
        quest_type: ['', Validators.required],
        questions: this.fb.array([])
      });
    }
 
    this.addQuestion();
    this.getAllCreatures();
    this.getAllActivities(); // Load activities
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
    queryParams.append('status', 'approved'); // Only show approved activities
    queryParams.append('page', '1');
    queryParams.append('limit', '100'); // Get all activities for dropdown

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
      correct_option: false,  
      quest_id: ''
    })  
  }     
  addQuestion() {  
    this.questions().push(this.newQuestion());  
  }  
  removeQuestion(i:number) {  
    // Ensure at least one answer always remains
      // Clear the corresponding file option if it exists
      const optionIndex = i + 1;
      if (optionIndex === 1) this.option1 = undefined;
      if (optionIndex === 2) this.option2 = undefined;
      if (optionIndex === 3) this.option3 = undefined;
      if (optionIndex === 4) this.option4 = undefined;
      if (optionIndex === 5) this.option5 = undefined;
      
      // Remove the question from the form array
      this.questions().removeAt(i);
      
      // Force change detection to update the UI
      this.cdr.detectChanges();

  } 
  onSubmit(){
    this.submitted = true;
    
    // Additional validation for numeric fields
    const formValue = this.questForm.value;
    
    if (this.auth.isAdmin) {
      // Validate No of XP - must be > 0
      if (formValue.no_of_xp <= 0 || isNaN(formValue.no_of_xp)) {
        Swal.fire("Validation Error!", "No of XP must be greater than 0", "error");
        this.questForm.patchValue({ no_of_xp: 1 });
        return;
      }
      
      // Validate No of Crypes - must be >= 0
      if (formValue.no_of_crypes < 0 || isNaN(formValue.no_of_crypes)) {
        Swal.fire("Validation Error!", "No of Crypes cannot be negative", "error");
        this.questForm.patchValue({ no_of_crypes: 0 });
        return;
      }
    }
    
    // Validate Level Increase - must be >= 0
    if (formValue.level_increase < 0 || isNaN(formValue.level_increase)) {
      Swal.fire("Validation Error!", "Level Increase cannot be negative", "error");
      this.questForm.patchValue({ level_increase: 0 });
      return;
    }
    
    // Ensure all numeric values are integers
    if (this.auth.isAdmin) {
      if (!Number.isInteger(formValue.no_of_xp)) {
        this.questForm.patchValue({ no_of_xp: Math.floor(formValue.no_of_xp) });
      }
      if (!Number.isInteger(formValue.no_of_crypes)) {
        this.questForm.patchValue({ no_of_crypes: Math.floor(formValue.no_of_crypes) });
      }
    }
    if (!Number.isInteger(formValue.level_increase)) {
      this.questForm.patchValue({ level_increase: Math.floor(formValue.level_increase) });
    }
    
    if (this.questForm?.valid) {
      this._sendSaveRequest(this.questForm.value);
    } else {
      // Show specific field errors
      const errors = [];
      if (this.f['quest_question']?.errors) errors.push('Quest Question');
      if (this.f['quest_title']?.errors) errors.push('Quest Title');
      if (this.f['no_of_xp']?.errors) errors.push('No of XP');
      if (this.f['no_of_crypes']?.errors) errors.push('No of Crypes');
      if (this.f['level_increase']?.errors) errors.push('Level Increase');
      if (this.f['mythica_ID']?.errors) errors.push('Mythica');
      if (this.f['quest_type']?.errors) errors.push('Quest Type');
      
      if (errors.length > 0) {
        Swal.fire("Validation Error!", `Please fix errors in: ${errors.join(', ')}`, "error");
      }
    }
  }
  _sendSaveRequest(formData: any) {
    this.sp.show();
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
    fD.append('qr_code', formData?.qr_code);
    fD.append('quest_type', formData?.quest_type);
    
    if(this.reward){
      fD.append('reward', this.reward!, this.reward?.name);
    }
    
    // Filter out empty or invalid questions before sending
    const validQuestions = (formData.questions || []).filter((q: any) => {
      // Only include questions that have at least an answer text or are marked as correct
      return q && (q.answer || q.correct_option === true || q.correct_option === 'true');
    });
    
    // Only append files for questions that still exist
    if(validQuestions.length >= 1 && this.option1){
      fD.append('option1', this.option1!, this.option1?.name);
    }
    if(validQuestions.length >= 2 && this.option2){
      fD.append('option2', this.option2!, this.option2?.name);
    }
    if(validQuestions.length >= 3 && this.option3){
      fD.append('option3', this.option3!, this.option3?.name);
    }
    if(validQuestions.length >= 4 && this.option4){
      fD.append('option4', this.option4!, this.option4?.name);
    }
    if(validQuestions.length >= 5 && this.option5){
      fD.append('option5', this.option5!, this.option5?.name);
    }
    
    if(this.quest_file){
      fD.append('quest_file', this.quest_file!, this.quest_file?.name);
    }
    
    // Only send valid questions
    fD.append('questions', JSON.stringify(validQuestions));
    
    this.api.postImageData('quest/createQuest', fD)
      .then((response: any) => {
          this.sp.hide();
          setTimeout(() => {
            this.helper.successToast("Quest Created Successfully");
          }, 1000);
          setTimeout(() => {
            this.router.navigate(['quest/list-quest']);
          }, 2000);
      })
      .catch((error) => {
        this.sp.hide();
        Swal.fire("Quest!", "There is an error, please try again", "error");
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
    // Extract the index from type (e.g., 'option1' -> 1)
    const optionIndex = parseInt(type.replace('option', ''), 10);
    
    // Check if this question still exists in the form
    if (optionIndex <= this.questions().length) {
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
    } else {
      // Question was deleted, clear the file
      event.target.value = '';
      Swal.fire("Warning!", "This answer was deleted. Please add it again before uploading a file.", "warning");
    }
  }

  preventNegativeInput(event: KeyboardEvent) {
    // Prevent minus sign, plus sign (for negative), 'e' (scientific notation), and '.' (decimals)
    const invalidKeys = ['-', '+', 'e', 'E', '.'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  validateNumberInput(event: any, fieldName: string, minValue: number = 0) {
    const input = event.target;
    let value = input.value;
    
    // Remove any negative signs
    if (value.includes('-')) {
      value = value.replace(/-/g, '');
    }
    
    // Convert to number
    const numValue = parseInt(value, 10);
    
    // If invalid, empty, or less than minValue, set to minValue
    if (isNaN(numValue) || value === '' || numValue < minValue) {
      input.value = minValue;
      // Update form control
      this.questForm.patchValue({ [fieldName]: minValue });
    } else {
      // Ensure it's a whole number (no decimals)
      const wholeNumber = Math.floor(numValue);
      input.value = wholeNumber;
      // Update form control
      this.questForm.patchValue({ [fieldName]: wholeNumber });
    }
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }
}
