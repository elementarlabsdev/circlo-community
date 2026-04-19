import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuEditCellRendererComponent } from './menu-edit-cell-renderer.component';

describe('MenuEditCellRendererComponent', () => {
  let component: MenuEditCellRendererComponent;
  let fixture: ComponentFixture<MenuEditCellRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuEditCellRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuEditCellRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
