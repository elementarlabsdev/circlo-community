import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListLayout } from './file-list-layout.component';

describe('FileListLayout', () => {
  let component: FileListLayout;
  let fixture: ComponentFixture<FileListLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileListLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
