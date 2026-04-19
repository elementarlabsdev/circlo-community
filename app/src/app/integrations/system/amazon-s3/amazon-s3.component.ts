import { Component } from '@angular/core';

@Component({
  selector: 'app-amazon-s3',
  imports: [],
  templateUrl: './amazon-s3.component.html',
  styleUrl: './amazon-s3.component.scss'
})
export class AmazonS3Component {
  logoUrl: 'assets/integrations/s3.svg';
  form: {
    elements: [
      {
        kind: 'field',
        name: 'bucket',
        type: 'input',
        label: 'Bucket',
        validators: [
          { type: 'required', message: 'Bucket is required' },
        ],
      },
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
        name: 'accessKey',
        type: 'input',
        label: 'Access Key',
        validators: [
          { type: 'required', message: 'Access Key is required' },
        ],
      },
      {
        kind: 'field',
        name: 'secretKey',
        type: 'input',
        label: 'Secret Key',
        validators: [
          { type: 'required', message: 'Secret Key is required' },
        ],
      },
    ],
    layout: {
      columns: 1,
      children: [
        { name: 'bucket' },
        { name: 'region' },
        { name: 'accessKey' },
        { name: 'secretKey' },
      ],
    },
  };
}
