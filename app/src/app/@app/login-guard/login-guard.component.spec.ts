import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginGuardComponent } from './login-guard.component';

describe('LoginGuardComponent', () => {
  let component: LoginGuardComponent;
  let fixture: ComponentFixture<LoginGuardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginGuardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginGuardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
