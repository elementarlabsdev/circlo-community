import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationStatusCellRendererComponent } from './publication-status-cell-renderer.component';

describe('PublicationStatusCellRendererComponent', () => {
  let component: PublicationStatusCellRendererComponent;
  let fixture: ComponentFixture<PublicationStatusCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationStatusCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationStatusCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
