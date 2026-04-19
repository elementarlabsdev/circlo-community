import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSmtpServerComponent } from './custom-smtp-server.component';

describe('CustomSmtpServerComponent', () => {
  let component: CustomSmtpServerComponent;
  let fixture: ComponentFixture<CustomSmtpServerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSmtpServerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSmtpServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
