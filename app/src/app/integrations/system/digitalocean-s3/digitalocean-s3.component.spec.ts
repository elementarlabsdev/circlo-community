import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitaloceanS3Component } from './digitalocean-s3.component';

describe('DigitaloceanS3Component', () => {
  let component: DigitaloceanS3Component;
  let fixture: ComponentFixture<DigitaloceanS3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitaloceanS3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitaloceanS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
