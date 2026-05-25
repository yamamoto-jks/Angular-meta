import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { META_HTTP_CLIENT_TOKEN } from './meta-form/http/HttpClient';
import { LambdaHttpClient } from './meta-form/http/LambdaHttpClient';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: META_HTTP_CLIENT_TOKEN,
      useClass: LambdaHttpClient,
    },
  ],
};
