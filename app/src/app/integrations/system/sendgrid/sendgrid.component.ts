import { Component } from '@angular/core';

@Component({
  selector: 'app-sendgrid',
  imports: [],
  templateUrl: './sendgrid.component.html',
  styleUrl: './sendgrid.component.scss'
})
export class SendgridComponent {
  logoUrl: 'assets/integrations/sendgrid.svg';
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
