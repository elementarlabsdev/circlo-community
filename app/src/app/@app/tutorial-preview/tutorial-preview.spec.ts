import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialPreview } from './tutorial-preview';

describe('TutorialPreview', () => {
  let component: TutorialPreview;
  let fixture: ComponentFixture<TutorialPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
