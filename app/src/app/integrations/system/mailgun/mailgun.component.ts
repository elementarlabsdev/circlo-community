import { Component } from '@angular/core';

@Component({
  selector: 'app-mailgun',
  imports: [],
  templateUrl: './mailgun.component.html',
  styleUrl: './mailgun.component.scss'
})
export class MailgunComponent {
  logoUrl: 'assets/integrations/mailrun.svg';
  form: {
    elements: [
      {
        kind: 'field',
        name: 'apiKey',
        type: 'input',
        label: 'API Key',
        validators: [
          { type: 'required', message: 'API Key is required' },
        ],
      },
    ],
    layout: {
      columns: 1,
      children: [{ name: 'apiKey' }],
    },
  };
}
