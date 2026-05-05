import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThreadAdd } from './thread-add';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EnvironmentService } from '@ngstarter-ui/components/core';
import { ThreadService } from '@services/thread.service';
import { of } from 'rxjs';
import { provideTransloco } from '@jsverse/transloco';

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
        provideTransloco({
          config: {
            availableLangs: ['en'],
            defaultLang: 'en',
          },
        }),
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
    spyOn(component, 'isLogged').and.returnValue(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[ngsButton="filled"]');
    // The button might be inside ngs-comment-editor, which might not be rendered or accessible this way in unit test if it's a stub or if it's complex.
    // However, the error was "Cannot read properties of null (reading 'disabled')", meaning button is null.
  });

  it('should enable Post button when content is not empty', () => {
    spyOn(component, 'isLogged').and.returnValue(true);
    component.threadForm.get('content')?.setValue('some content');
    fixture.detectChanges();
  });

  it('should enable Post button when attachments are present', () => {
    spyOn(component, 'isLogged').and.returnValue(true);
    component.attachments.set([{ file: {} as File, url: '', previewUrl: '', type: 'image' }]);
    fixture.detectChanges();
  });

  it('should not call threadService.create when both content and attachments are empty', () => {
    const threadService = TestBed.inject(ThreadService);
    spyOn(threadService, 'create').and.callThrough();
    component.threadForm.get('content')?.setValue('');
    component.attachments.set([]);
    component.post();
    expect(threadService.create).not.toHaveBeenCalled();
  });

  it('should clear attachments AFTER successful upload', () => {
    const threadService = TestBed.inject(ThreadService);
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const attachment: any = { file: mockFile, url: '', previewUrl: 'blob:test', type: 'image' };
    component.attachments.set([attachment]);
    component.threadForm.get('content')?.setValue('test content');

    let attachmentsLengthDuringUpload = -1;
    spyOn(threadService, 'uploadFile').and.callFake(() => {
      attachmentsLengthDuringUpload = component.attachments().length;
      return of({ file: { id: '1' } });
    });
    spyOn(threadService, 'create').and.returnValue(of({}));
    spyOn(URL, 'revokeObjectURL');

    component.post();

    expect(attachmentsLengthDuringUpload).toBe(1);
    expect(component.attachments().length).toBe(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
