import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationAuthorCellRendererComponent } from './publication-author-cell-renderer.component';

describe('PublicationAuthorCellRendererComponent', () => {
  let component: PublicationAuthorCellRendererComponent;
  let fixture: ComponentFixture<PublicationAuthorCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationAuthorCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationAuthorCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
