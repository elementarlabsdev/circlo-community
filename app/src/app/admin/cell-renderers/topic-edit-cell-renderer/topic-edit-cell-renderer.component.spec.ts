import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicEditCellRendererComponent } from './topic-edit-cell-renderer.component';

describe('TopicEditCellRendererComponent', () => {
  let component: TopicEditCellRendererComponent;
  let fixture: ComponentFixture<TopicEditCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicEditCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicEditCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
