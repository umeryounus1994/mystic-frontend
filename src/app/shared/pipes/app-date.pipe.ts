import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { APP_DATE_FORMAT, APP_DATETIME_FORMAT } from '../../constants/constants';

@Pipe({ name: 'appDate' })
export class AppDatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: string | Date | null | undefined, mode: 'date' | 'datetime' = 'date'): string {
    if (value == null) return '';
    const locale = this.translate.currentLang === 'de' ? 'de' : 'en';
    const format = mode === 'datetime' ? APP_DATETIME_FORMAT : APP_DATE_FORMAT;
    return formatDate(value, format, locale).toLowerCase();
  }
}
