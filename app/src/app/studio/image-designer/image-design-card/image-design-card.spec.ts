import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDesignCard } from './image-design-card';

describe('ImageDesignCard', () => {
  let component: ImageDesignCard;
  let fixture: ComponentFixture<ImageDesignCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageDesignCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageDesignCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
