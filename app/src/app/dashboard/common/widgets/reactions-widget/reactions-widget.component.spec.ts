import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionsWidgetComponent } from './reactions-widget.component';

describe('ReactionsWidgetComponent', () => {
  let component: ReactionsWidgetComponent;
  let fixture: ComponentFixture<ReactionsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactionsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
