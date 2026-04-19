import { Component } from '@angular/core';

@Component({
  selector: 'app-x',
  imports: [],
  templateUrl: './x.component.html',
  styleUrl: './x.component.scss'
})
export class XComponent {
  logoUrl: 'assets/integrations/x.svg';
  form: {
    elements: [
      {
        kind: 'field',
        name: 'clientId',
        type: 'input',
        label: 'Client ID',
        validators: [
          {
            type: 'required',
            message: 'Client ID required',
          },
        ],
      },
      {
        kind: 'field',
        name: 'clientSecret',
        type: 'input',
        label: 'Client Secret',
        validators: [
          {
            type: 'required',
            message: 'Client Secret is required',
          },
        ],
      },
    ],
    layout: {
      children: [{ name: 'clientId' }, { name: 'clientSecret' }],
    },
  };
}
