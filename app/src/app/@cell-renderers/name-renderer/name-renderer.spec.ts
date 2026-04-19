import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameRenderer } from './name-renderer';

describe('NameRenderer', () => {
  let component: NameRenderer;
  let fixture: ComponentFixture<NameRenderer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameRenderer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NameRenderer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
