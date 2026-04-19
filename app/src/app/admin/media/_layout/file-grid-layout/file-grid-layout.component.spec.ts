import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileGridLayout } from './file-grid-layout.component';

describe('FileGridLayout', () => {
  let component: FileGridLayout;
  let fixture: ComponentFixture<FileGridLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileGridLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileGridLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
