import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationsWidgetComponent } from './publications-widget.component';

describe('PublicationsWidgetComponent', () => {
  let component: PublicationsWidgetComponent;
  let fixture: ComponentFixture<PublicationsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationsWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
