import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentCellRendererComponent } from './comment-cell-renderer.component';

describe('CommentCellRendererComponent', () => {
  let component: CommentCellRendererComponent;
  let fixture: ComponentFixture<CommentCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
