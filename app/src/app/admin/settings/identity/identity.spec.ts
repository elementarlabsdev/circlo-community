import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Identity } from './identity';

describe('Identity', () => {
  let component: Identity;
  let fixture: ComponentFixture<Identity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Identity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Identity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
