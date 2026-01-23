import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { CoreModule } from './app/core/core.module';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserModule, AppRoutingModule), provideAnimations(),importProvidersFrom(CoreModule),    provideHttpClient(
      withInterceptors([authInterceptor])
    )]
}).catch((err) => console.error(err));
