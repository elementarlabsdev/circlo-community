import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationTitleCellRenderer } from './publication-title-cell-renderer';

describe('PublicationTitleCellRenderer', () => {
  let component: PublicationTitleCellRenderer;
  let fixture: ComponentFixture<PublicationTitleCellRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationTitleCellRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationTitleCellRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
