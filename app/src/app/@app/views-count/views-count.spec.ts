import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewsCount } from './views-count';

describe('ViewsCount', () => {
  let component: ViewsCount;
  let fixture: ComponentFixture<ViewsCount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewsCount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewsCount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
