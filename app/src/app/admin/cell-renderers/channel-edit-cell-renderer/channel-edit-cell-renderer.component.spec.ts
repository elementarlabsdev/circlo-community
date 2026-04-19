import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelEditCellRendererComponent } from './channel-edit-cell-renderer.component';

describe('ChannelEditCellRendererComponent', () => {
  let component: ChannelEditCellRendererComponent;
  let fixture: ComponentFixture<ChannelEditCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelEditCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelEditCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
