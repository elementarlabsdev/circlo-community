import { Component } from '@angular/core';

@Component({
  selector: 'app-custom-smtp-server',
  imports: [],
  templateUrl: './custom-smtp-server.component.html',
  styleUrl: './custom-smtp-server.component.scss'
})
export class CustomSmtpServerComponent {
  logoUrl: 'assets/integrations/custom-smtp-server.svg';
  form: {
    elements: [
      {
        kind: 'field',
        name: 'host',
        type: 'input',
        label: 'Host',
        hint: 'smtp.example.com',
        validators: [
          {
            type: 'required',
            message: 'Host is required',
          },
        ],
      },
      {
        kind: 'field',
        name: 'port',
        type: 'input',
        label: 'Port',
        validators: [
          {
            type: 'required',
            message: 'Port is required',
          },
        ],
      },
      {
        kind: 'field',
        name: 'user',
        type: 'input',
        label: 'User',
        validators: [
          {
            type: 'required',
            message: 'User is required',
          },
        ],
      },
      {
        kind: 'field',
        name: 'password',
        type: 'input',
        inputType: 'password',
        label: 'Password',
        validators: [
          {
            type: 'required',
            message: 'Password is required',
          },
        ],
      },
    ],
    layout: {
      columns: 1,
      children: [
        { name: 'host' },
        { name: 'port' },
        { name: 'user' },
        { name: 'password' },
      ],
    },
  };
}
