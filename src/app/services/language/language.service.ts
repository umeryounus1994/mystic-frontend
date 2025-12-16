import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly DEFAULT_LANG = 'en';
  private readonly STORAGE_KEY = 'app_language';

  constructor(private translate: TranslateService) {
    // Get saved language or default
    const savedLang = localStorage.getItem(this.STORAGE_KEY) || this.DEFAULT_LANG;
    // Set default language first
    this.translate.setDefaultLang(this.DEFAULT_LANG);
    // Then set the saved language
    if (savedLang) {
      this.setLanguage(savedLang as 'en' | 'de');
    }
  }

  setLanguage(lang: 'en' | 'de') {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.translate.use(lang).subscribe(() => {
      // Language changed successfully
    });
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.DEFAULT_LANG;
  }

  toggleLanguage() {
    const current = this.getCurrentLanguage();
    const newLang = current === 'en' ? 'de' : 'en';
    this.setLanguage(newLang);
    return newLang;
  }

  isGerman(): boolean {
    return this.getCurrentLanguage() === 'de';
  }

  isEnglish(): boolean {
    return this.getCurrentLanguage() === 'en';
  }
}

