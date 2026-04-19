import { TestBed } from '@angular/core/testing';

import { TranslatedPageTitleStrategyService } from './translated-page-title-strategy.service';

describe('TranslatedPageTitleStrategyService', () => {
  let service: TranslatedPageTitleStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslatedPageTitleStrategyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
