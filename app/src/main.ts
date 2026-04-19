import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import 'lazysizes';
import 'lazysizes/plugins/parent-fit/ls.parent-fit';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
