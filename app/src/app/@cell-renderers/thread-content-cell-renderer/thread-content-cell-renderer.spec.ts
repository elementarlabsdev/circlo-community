import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadContentCellRenderer } from './thread-content-cell-renderer';

describe('ThreadContentCellRenderer', () => {
  let component: ThreadContentCellRenderer;
  let fixture: ComponentFixture<ThreadContentCellRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadContentCellRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadContentCellRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
