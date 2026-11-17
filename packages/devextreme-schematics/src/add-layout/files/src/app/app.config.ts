import { ApplicationConfig<% if (!zoneless) { %>, provideZoneChangeDetection<% } %> } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [<% if (!zoneless) { %>
    provideZoneChangeDetection({ eventCoalescing: true }),<% } %>
    provideRouter(routes, withHashLocation()),
  ]
};
