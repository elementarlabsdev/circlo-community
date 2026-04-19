import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandrillComponent } from './mandrill.component';

describe('MandrillComponent', () => {
  let component: MandrillComponent;
  let fixture: ComponentFixture<MandrillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MandrillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MandrillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
