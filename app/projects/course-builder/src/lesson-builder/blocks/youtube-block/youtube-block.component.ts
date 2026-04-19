import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormField, FormFieldModule, Label } from '@ngstarter/components/form-field';
import { Input, InputModule } from '@ngstarter/components/input';
import { ReactiveFormsModule, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  LessonBuilderCommunicatorService
} from '../../lesson-builder-communicator.service';
import { LessonBlock, YoutubeBlockData } from '../../../models/lesson-block.model';
import {
  LessonBuilderComponent
} from '../../lesson-builder/lesson-builder.component';

// Custom Angular validator: returns { youtubeUrl: true } if value is non-empty and not a valid YouTube URL.
const youtubeUrlValidator: ValidatorFn = (control): ValidationErrors | null => {
  const value = (control.value ?? '').toString().trim();
  if (!value) return null; // empty is allowed
  try {
    const u = new URL(value);
    const host = u.hostname.toLowerCase();
    const isYouTubeCom = host === 'youtube.com' || host.endsWith('.youtube.com');
    const isYouTubeNoCookie = host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com');
    const isYoutuBe = host === 'youtu.be';

    if (isYouTubeCom) {
      const v = u.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return null;
    }
    if (isYoutuBe) {
      const shortSeg = u.pathname.split('/').filter(Boolean)[0] || '';
      if (shortSeg && /^[A-Za-z0-9_-]{11}$/.test(shortSeg)) return null;
    }
    if (isYouTubeCom || isYouTubeNoCookie) {
      const parts = u.pathname.split('/').filter(Boolean);
      const candidates = ['embed', 'shorts'];
      if (parts.length >= 2 && candidates.includes(parts[0])) {
        const id = parts[1];
        if (/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
      }
    }
  } catch {
    // ignore, fall-through to error
  }
  return { youtubeUrl: true };
};

@Component({
  selector: 'app-youtube-block',
  imports: [CommonModule, FormFieldModule, InputModule, ReactiveFormsModule, Input, Label, FormField, Error$1],
  templateUrl: './youtube-block.component.html',
  styleUrl: './youtube-block.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubeBlockComponent {
  private communicator = inject(LessonBuilderCommunicatorService);
  private destroyRef = inject(DestroyRef);
  private sanitizer = inject(DomSanitizer);

  block = input.required<LessonBlock<YoutubeBlockData>>();
  builder = input.required<LessonBuilderComponent>();

  protected embedUrlSafe = signal<SafeResourceUrl | null>(null);
  protected ytControl = new FormControl<string>('', { nonNullable: true, validators: [youtubeUrlValidator] });

  ngOnInit() {
    const existing = (this.block().data.embedUrl || '').trim();
    if (existing) {
      this.embedUrlSafe.set(this.sanitizer.bypassSecurityTrustResourceUrl(existing));
    }

    this.ytControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.applyUrlChange(value));
  }

  getData(): YoutubeBlockData {
    return {
      embedUrl: this.block().data.embedUrl || ''
    };
  }

  isEmpty(): boolean {
    return !(this.block().data.embedUrl || '').trim();
  }

  private applyUrlChange(value: string) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      this.embedUrlSafe.set(null);
      this.block().data.embedUrl = '';
      this.builder().emitChange();
      return;
    }

    if (this.ytControl.invalid) {
      this.embedUrlSafe.set(null);
      this.block().data.embedUrl = '';
      this.builder().emitChange();
      return;
    }

    // Valid per validator — compute the embed URL by extracting the ID.
    const id = this.extractYoutubeId(trimmed);
    if (!id) {
      // Should not happen if validator ngsches, but defensively handle it.
      this.embedUrlSafe.set(null);
      this.block().data.embedUrl = '';
      this.builder().emitChange();
      return;
    }

    const embed = `https://www.youtube.com/embed/${id}`;
    this.block().data.embedUrl = embed;
    this.embedUrlSafe.set(this.sanitizer.bypassSecurityTrustResourceUrl(embed));
    this.builder().emitChange();
  }

  private extractYoutubeId(url: string): string | null {
    try {
      const u = new URL(url.trim());
      const host = u.hostname.toLowerCase();
      const isYouTubeCom = host === 'youtube.com' || host.endsWith('.youtube.com');
      const isYouTubeNoCookie = host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com');
      const isYoutuBe = host === 'youtu.be';

      // Standard watch URL on YouTube domains: https://www.youtube.com/watch?v=VIDEO_ID
      if (isYouTubeCom) {
        const vParam = u.searchParams.get('v');
        if (vParam && /^[A-Za-z0-9_-]{11}$/.test(vParam)) return vParam;
      }

      // youtu.be/VIDEO_ID (take only the first segment)
      if (isYoutuBe) {
        const shortSeg = u.pathname.split('/').filter(Boolean)[0] || '';
        if (shortSeg && /^[A-Za-z0-9_-]{11}$/.test(shortSeg)) return shortSeg;
      }

      // youtube.com/embed/VIDEO_ID or /shorts/VIDEO_ID (also accept youtube-nocookie.com for embed)
      if (isYouTubeCom || isYouTubeNoCookie) {
        const pathParts = u.pathname.split('/').filter(Boolean);
        const candidates = ['embed', 'shorts'];
        if (pathParts.length >= 2 && candidates.includes(pathParts[0])) {
          const id = pathParts[1];
          if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
        }
      }

      return null;
    } catch {
      // Not a valid URL
      return null;
    }
  }
}
