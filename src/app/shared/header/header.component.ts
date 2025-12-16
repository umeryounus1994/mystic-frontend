import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { LanguageService } from '../../services/language/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentLanguage: string = 'en';
  languageDisplay: string = 'DE';
  private langChangeSubscription?: Subscription;

   constructor(
     public auth: AuthService,
     public languageService: LanguageService,
     public translate: TranslateService,
     private cdr: ChangeDetectorRef
   ){}

   ngOnInit() {
     // Set initial language
     this.updateCurrentLanguage();
     
     // Subscribe to language changes
     this.langChangeSubscription = this.translate.onLangChange.subscribe((event) => {
       this.updateCurrentLanguage();
       this.cdr.detectChanges();
     });
   }

   ngOnDestroy() {
     if (this.langChangeSubscription) {
       this.langChangeSubscription.unsubscribe();
     }
   }

   updateCurrentLanguage() {
     const lang = this.translate.currentLang || this.languageService.getCurrentLanguage() || 'en';
     this.currentLanguage = lang;
     this.languageDisplay = lang === 'en' ? 'DE' : 'EN';
   }

   toggleLanguage() {
     const current = this.translate.currentLang || this.currentLanguage || 'en';
     const newLang = current === 'en' ? 'de' : 'en';
     
     console.log('Toggling language from', current, 'to', newLang);
     
     // Update language through service
     this.languageService.setLanguage(newLang);
     
     // Update immediately
     this.currentLanguage = newLang;
     this.cdr.detectChanges();
     
     // Also update after language change completes
     setTimeout(() => {
       this.updateCurrentLanguage();
       this.cdr.detectChanges();
       console.log('Language after toggle:', this.translate.currentLang, this.currentLanguage);
     }, 100);
   }

}
