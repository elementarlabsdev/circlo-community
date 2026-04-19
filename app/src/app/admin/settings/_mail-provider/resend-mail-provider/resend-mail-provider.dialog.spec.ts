import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendMailProviderDialog } from './resend-mail-provider.dialog';

describe('ResendMailProviderDialog', () => {
  let component: ResendMailProviderDialog;
  let fixture: ComponentFixture<ResendMailProviderDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResendMailProviderDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResendMailProviderDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
