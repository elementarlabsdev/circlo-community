import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GettingStartedWidget } from './getting-started-widget';

describe('GettingStartedWidget', () => {
  let component: GettingStartedWidget;
  let fixture: ComponentFixture<GettingStartedWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GettingStartedWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GettingStartedWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
