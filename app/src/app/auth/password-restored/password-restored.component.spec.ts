import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordRestoredComponent } from './password-restored.component';

describe('PasswordRestoredComponent', () => {
  let component: PasswordRestoredComponent;
  let fixture: ComponentFixture<PasswordRestoredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRestoredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordRestoredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
