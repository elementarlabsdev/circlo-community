import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataViewSkeletonComponent } from './data-view-skeleton.component';

describe('DataViewSkeletonComponent', () => {
  let component: DataViewSkeletonComponent;
  let fixture: ComponentFixture<DataViewSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataViewSkeletonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataViewSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
