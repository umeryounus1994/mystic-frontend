import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './services/language/language.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    // LanguageService constructor already handles language initialization
    // Just ensure default is set
    this.translate.setDefaultLang('en');
  }

  ngOnInit() {
    // Ensure translations are loaded
    this.translate.get('COMMON.LOADING').subscribe(() => {
      // Translations loaded
    });
  }
}
