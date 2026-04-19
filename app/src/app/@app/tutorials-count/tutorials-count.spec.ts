import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialsCount } from './tutorials-count';

describe('TutorialsCount', () => {
  let component: TutorialsCount;
  let fixture: ComponentFixture<TutorialsCount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialsCount]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TutorialsCount);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
