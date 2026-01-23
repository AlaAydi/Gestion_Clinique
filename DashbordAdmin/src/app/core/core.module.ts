import { NgModule, importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  providers: [
    importProvidersFrom(HttpClientModule) 
  ]
})
export class CoreModule {}
