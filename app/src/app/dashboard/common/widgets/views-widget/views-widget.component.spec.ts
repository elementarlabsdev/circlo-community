import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewsWidgetComponent } from './views-widget.component';

describe('ViewsWidgetComponent', () => {
  let component: ViewsWidgetComponent;
  let fixture: ComponentFixture<ViewsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
