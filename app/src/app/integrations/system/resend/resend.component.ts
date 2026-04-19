import { Component } from '@angular/core';

@Component({
  selector: 'app-resend',
  imports: [],
  templateUrl: './resend.component.html',
  styleUrl: './resend.component.scss'
})
export class ResendComponent {
  logoUrl: 'assets/integrations/resend.svg';
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
      children: [{ name: 'apiKey' }],
    },
  };
}
