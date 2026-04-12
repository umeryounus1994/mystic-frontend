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
  readonly defaultAvatarSrc = 'assets/images/avatar/01.jpg';
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

  /**
   * Name shown after "Welcome back" — admins use first + last name from the API;
   * other roles keep username (with sensible fallbacks).
   */
  getWelcomeUserName(): string {
    const u = this.auth.user;
    if (!u) {
      return '';
    }
    if (u.user_type === 'admin' || u.user_type === 'subadmin') {
      const fn = (u.first_name ?? '').toString().trim();
      const ln = (u.last_name ?? '').toString().trim();
      const full = `${fn} ${ln}`.trim();
      return full || (u.email ?? '').toString() || (u.username ?? '').toString() || '';
    }
    return (u.username ?? '').toString() || (u.email ?? '').toString() || '';
  }

  /** Profile image URL when `user.image` is set; otherwise the default avatar asset. */
  getHeaderAvatarSrc(): string {
    const u = this.auth.user;
    if (!u) {
      return this.defaultAvatarSrc;
    }
    const raw = u.image;
    if (raw == null) {
      return this.defaultAvatarSrc;
    }
    const s = String(raw).trim();
    return s !== '' ? s : this.defaultAvatarSrc;
  }

  onHeaderAvatarError(event: Event): void {
    const el = event.target as HTMLImageElement | null;
    if (el && el.src !== this.defaultAvatarSrc) {
      el.src = this.defaultAvatarSrc;
    }
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
