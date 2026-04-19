import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaTags } from './meta-tags';

describe('MetaTags', () => {
  let component: MetaTags;
  let fixture: ComponentFixture<MetaTags>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetaTags]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetaTags);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
