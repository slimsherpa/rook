import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
<<<<<<< HEAD

bootstrapApplication(AppComponent).catch(err => console.error(err));
=======
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(),
  ]
}).catch(err => console.error(err));
>>>>>>> 7fe72b2e11581fc3e200e395f18963ab9f008448
