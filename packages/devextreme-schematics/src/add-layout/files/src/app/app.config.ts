import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
    AppInfoService,
    AuthGuardService,
    AuthService,
    ScreenService,
} from './shared/services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    AuthGuardService,
    AuthService,
    ScreenService,
    AppInfoService,
  ]
};
