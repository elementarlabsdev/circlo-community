import { Component } from '@angular/core';

@Component({
  selector: 'app-google-adsense',
  imports: [],
  templateUrl: './google-adsense.component.html',
  styleUrl: './google-adsense.component.scss'
})
export class GoogleAdsenseComponent {
  logoUrl: 'assets/integrations/google-adsense.svg';
  form: {
    elements: [
      {
        kind: 'field',
        name: 'pubId',
        type: 'input',
        label: 'Google Adsense Pub ID',
        validators: [
          {
            type: 'required',
            message: 'Google Adsense Pub ID is required',
          },
        ],
      },
    ],
    layout: {
      columns: 1,
      children: [{ name: 'pubId' }],
    },
  };
}
