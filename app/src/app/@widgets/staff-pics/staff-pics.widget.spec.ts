import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffPicsWidget } from './staff-pics.widget';

describe('StaffPicsWidget', () => {
  let component: StaffPicsWidget;
  let fixture: ComponentFixture<StaffPicsWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffPicsWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffPicsWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
