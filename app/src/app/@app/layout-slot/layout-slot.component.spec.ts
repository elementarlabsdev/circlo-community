import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSlotComponent } from './layout-slot.component';

describe('LayoutSlotComponent', () => {
  let component: LayoutSlotComponent;
  let fixture: ComponentFixture<LayoutSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
