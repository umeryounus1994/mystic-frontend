import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './auth-language-switcher.component.html',
  styleUrl: './auth-language-switcher.component.scss'
})
export class AuthLanguageSwitcherComponent implements OnInit, OnDestroy {
  languageDisplay = 'DE';
  private langSub?: Subscription;

  constructor(
    public languageService: LanguageService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.updateDisplay();
    this.langSub = this.translate.onLangChange.subscribe(() => this.updateDisplay());
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  toggleLanguage(): void {
    this.languageService.toggleLanguage();
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const lang = this.translate.currentLang || this.languageService.getCurrentLanguage() || 'en';
    this.languageDisplay = lang === 'en' ? 'DE' : 'EN';
  }
}
