import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmazonSesComponent } from './amazon-ses.component';

describe('AmazonSesComponent', () => {
  let component: AmazonSesComponent;
  let fixture: ComponentFixture<AmazonSesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmazonSesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmazonSesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
