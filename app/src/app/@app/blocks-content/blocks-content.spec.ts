import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocksContent } from './blocks-content';

describe('BlocksContent', () => {
  let component: BlocksContent;
  let fixture: ComponentFixture<BlocksContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlocksContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlocksContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
