import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendgridComponent } from './sendgrid.component';

describe('SendgridComponent', () => {
  let component: SendgridComponent;
  let fixture: ComponentFixture<SendgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendgridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
