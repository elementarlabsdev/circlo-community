import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HetznerS3Component } from './hetzner-s3.component';

describe('HetznerS3Component', () => {
  let component: HetznerS3Component;
  let fixture: ComponentFixture<HetznerS3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HetznerS3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HetznerS3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
