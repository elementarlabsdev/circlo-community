import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseKey } from './license-key';

describe('LicenseKey', () => {
  let component: LicenseKey;
  let fixture: ComponentFixture<LicenseKey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseKey]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseKey);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
