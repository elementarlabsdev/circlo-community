import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentEditCellRendererComponent } from './comment-edit-cell-renderer.component';

describe('CommentEditCellRendererComponent', () => {
  let component: CommentEditCellRendererComponent;
  let fixture: ComponentFixture<CommentEditCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentEditCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentEditCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
