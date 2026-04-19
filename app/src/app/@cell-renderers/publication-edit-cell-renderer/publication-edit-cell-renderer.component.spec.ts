import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationEditCellRendererComponent } from './publication-edit-cell-renderer.component';

describe('PublicationEditCellRendererComponent', () => {
  let component: PublicationEditCellRendererComponent;
  let fixture: ComponentFixture<PublicationEditCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationEditCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationEditCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
