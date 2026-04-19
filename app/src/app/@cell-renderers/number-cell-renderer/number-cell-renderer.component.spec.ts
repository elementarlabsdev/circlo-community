import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberCellRendererComponent } from './number-cell-renderer.component';

describe('NumberCellRendererComponent', () => {
  let component: NumberCellRendererComponent;
  let fixture: ComponentFixture<NumberCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumberCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
