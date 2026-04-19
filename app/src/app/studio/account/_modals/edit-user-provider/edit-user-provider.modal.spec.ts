import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserProviderModal } from './edit-user-provider.modal';

describe('EditUserProviderModal', () => {
  let component: EditUserProviderModal;
  let fixture: ComponentFixture<EditUserProviderModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserProviderModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserProviderModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
