import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEditCellRendererComponent } from './page-edit-cell-renderer.component';

describe('PageEditCellRendererComponent', () => {
  let component: PageEditCellRendererComponent;
  let fixture: ComponentFixture<PageEditCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEditCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageEditCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
