import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactionsCountComponent } from './reactions-count.component';

describe('ReactionsCountComponent', () => {
  let component: ReactionsCountComponent;
  let fixture: ComponentFixture<ReactionsCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactionsCountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactionsCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
