import { Component } from '@angular/core';

@Component({
  selector: 'app-amazon-ses',
  imports: [],
  templateUrl: './amazon-ses.component.html',
  styleUrl: './amazon-ses.component.scss'
})
export class AmazonSesComponent {
  logoUrl: 'assets/integrations/sendgrid.svg';
  form: {
    elements: [
      {
        kind: 'field',
        name: 'region',
        type: 'input',
        label: 'Region',
        validators: [
          { type: 'required', message: 'Region is required' },
        ],
      },
      {
        kind: 'field',
        name: 'accessKeyId',
        type: 'input',
        label: 'Access Key Id',
        validators: [
          {
            type: 'required',
            message: 'Access Key Id is required',
          },
        ],
      },
      {
        kind: 'field',
        name: 'secretAccessKey',
        type: 'input',
        label: 'Secret Access Key',
        validators: [
          {
            type: 'required',
            message: 'Secret Access Key is required',
          },
        ],
      },
    ],
    layout: {
      columns: 1,
      children: [
        { name: 'region' },
        { name: 'accessKeyId' },
        { name: 'secretAccessKey' },
      ],
    },
  };
}
