import { Component } from '@angular/core';

@Component({
  selector: 'app-mandrill',
  imports: [],
  templateUrl: './mandrill.component.html',
  styleUrl: './mandrill.component.scss'
})
export class MandrillComponent {
  logoUrl: 'assets/integrations/mandrill.svg';
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
