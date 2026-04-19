import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationViewCellRendererComponent } from './publication-view-cell-renderer.component';

describe('PublicationViewCellRendererComponent', () => {
  let component: PublicationViewCellRendererComponent;
  let fixture: ComponentFixture<PublicationViewCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationViewCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationViewCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
