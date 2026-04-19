import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailgunComponent } from './mailgun.component';

describe('MailgunComponent', () => {
  let component: MailgunComponent;
  let fixture: ComponentFixture<MailgunComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailgunComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailgunComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
