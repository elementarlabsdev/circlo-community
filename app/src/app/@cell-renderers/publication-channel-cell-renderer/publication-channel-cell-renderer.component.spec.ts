import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationChannelCellRendererComponent } from './publication-channel-cell-renderer.component';

describe('PublicationChannelCellRendererComponent', () => {
  let component: PublicationChannelCellRendererComponent;
  let fixture: ComponentFixture<PublicationChannelCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationChannelCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationChannelCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
