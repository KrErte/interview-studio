import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { createTranslateLoader } from './i18n/translate-loader';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

function initTranslations(translate: TranslateService): () => Promise<void> {
  return async () => {
    translate.setDefaultLang('en');
    const savedLang = localStorage.getItem('lang') || 'en';
    await firstValueFrom(translate.use(savedLang));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        useDefaultLang: true,
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslations,
      deps: [TranslateService],
      multi: true
    }
  ]
};
