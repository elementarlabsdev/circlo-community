import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThreadAdd } from './thread-add';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EnvironmentService } from '@ngstarter-ui/components/core';
import { ThreadService } from '@services/thread.service';

describe('ThreadAdd', () => {
  let component: ThreadAdd;
  let fixture: ComponentFixture<ThreadAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadAdd],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        {
          provide: EnvironmentService,
          useValue: {
            getValue: (key: string) => ''
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable Post button when content is empty and no attachments', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[ngsButton="filled"]');
    expect(button.disabled).toBeTrue();
  });

  it('should enable Post button when content is not empty', () => {
    component.threadForm.get('content')?.setValue('some content');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[ngsButton="filled"]');
    expect(button.disabled).toBeFalse();
  });

  it('should enable Post button when attachments are present', () => {
    component.attachments.set([{ file: {} as File, url: '', previewUrl: '', type: 'image' }]);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[ngsButton="filled"]');
    expect(button.disabled).toBeFalse();
  });

  it('should not call threadService.create when both content and attachments are empty', () => {
    const threadService = TestBed.inject(ThreadService);
    spyOn(threadService, 'create').and.callThrough();
    component.threadForm.get('content')?.setValue('');
    component.attachments.set([]);
    component.post();
    expect(threadService.create).not.toHaveBeenCalled();
  });
});
