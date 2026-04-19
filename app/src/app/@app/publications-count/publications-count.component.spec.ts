import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationsCountComponent } from './publications-count.component';

describe('PublicationsCountComponent', () => {
  let component: PublicationsCountComponent;
  let fixture: ComponentFixture<PublicationsCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationsCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationsCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
