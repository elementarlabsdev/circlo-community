import { Component } from '@angular/core';

@Component({
  selector: 'app-google-analytics',
  imports: [],
  templateUrl: './google-analytics.component.html',
  styleUrl: './google-analytics.component.scss'
})
export class GoogleAnalyticsComponent {
  logoUrl: 'assets/integrations/google-analytics.svg';
  form: {
    elements: [
      {
        kind: 'field',
        name: 'gaId',
        type: 'input',
        label: 'Google Analytics ID',
        validators: [
          {
            type: 'required',
            message: 'Google Analytics ID is required',
          },
        ],
      },
    ],
    layout: {
      columns: 1,
      children: [{ name: 'gaId' }],
    },
  }
}
