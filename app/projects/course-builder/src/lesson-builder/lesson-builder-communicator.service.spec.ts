import { TestBed } from '@angular/core/testing';

import { LessonBuilderCommunicatorService } from './lesson-builder-communicator.service';

describe('LessonBuilderCommunicatorService', () => {
  let service: LessonBuilderCommunicatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LessonBuilderCommunicatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
