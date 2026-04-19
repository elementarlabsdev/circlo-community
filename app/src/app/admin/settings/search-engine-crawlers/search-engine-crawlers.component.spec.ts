import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchEngineCrawlersComponent } from './search-engine-crawlers.component';

describe('SearchEngineCrawlersComponent', () => {
  let component: SearchEngineCrawlersComponent;
  let fixture: ComponentFixture<SearchEngineCrawlersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchEngineCrawlersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchEngineCrawlersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
