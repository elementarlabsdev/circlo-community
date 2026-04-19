import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicationSkeletonComponent } from './publication-skeleton.component';

describe('PublicationSkeletonComponent', () => {
  let component: PublicationSkeletonComponent;
  let fixture: ComponentFixture<PublicationSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicationSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicationSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
