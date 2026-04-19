import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthorCellRendererComponent } from './author-cell-renderer.component';

describe('AuthorCellRendererComponent', () => {
  let component: AuthorCellRendererComponent;
  let fixture: ComponentFixture<AuthorCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthorCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
