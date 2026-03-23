import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Factory used by ngx-translate to load translation files from /assets/i18n/{lang}.json
// Cache-buster suffix ensures browsers pick up new translations after each deploy
const buildTs = new Date().getTime();
export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/assets/i18n/', `.json?v=${buildTs}`);
}


