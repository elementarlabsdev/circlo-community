import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTitleCellRenderer } from './page-title-cell-renderer';

describe('PageTitleCellRenderer', () => {
  let component: PageTitleCellRenderer;
  let fixture: ComponentFixture<PageTitleCellRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageTitleCellRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTitleCellRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
