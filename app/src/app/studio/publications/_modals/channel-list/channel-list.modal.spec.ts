import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelListModal } from './channel-list.modal';

describe('ChannelListModal', () => {
  let component: ChannelListModal;
  let fixture: ComponentFixture<ChannelListModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelListModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
