import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InResponseToCellRendererComponent } from './in-response-to-cell-renderer.component';

describe('InResponseToCellRendererComponent', () => {
  let component: InResponseToCellRendererComponent;
  let fixture: ComponentFixture<InResponseToCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InResponseToCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InResponseToCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
