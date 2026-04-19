import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingTime } from './reading-time';

describe('ReadingTime', () => {
  let component: ReadingTime;
  let fixture: ComponentFixture<ReadingTime>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingTime]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadingTime);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
