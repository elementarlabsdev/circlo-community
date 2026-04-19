import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy, PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import type * as dashjs from 'dashjs';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Icon } from '@ngstarter/components/icon';
import { Button } from '@ngstarter/components/button';
import { Slider, SliderThumb } from '@ngstarter/components/slider';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ngs-video-player',
  exportAs: 'ngsVideoPlayer',
  imports: [
    Icon,
    Button,
    Slider,
    SliderThumb
  ],
  templateUrl: './video-player.html',
  styleUrl: './video-player.scss',
  host: {
    'class': 'ngs-video-player',
    '[class.aspect-video]': 'orientation() === "landscape"',
    '[class.aspect-[9/16]]': 'orientation() === "portrait"',
    '[class.max-w-[400px]]': 'orientation() === "portrait"',
    '[class.aspect-square]': 'orientation() === "square"',
  }
})
export class VideoPlayer implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  src = input<string | null>(null);
  payload = input<any | null>(null);
  autoPlay = input(false);

  videoElement = viewChild<ElementRef<HTMLVideoElement>>('videoElement');
  loaded = signal(false);
  isPlaying = signal(false);
  hasStarted = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);
  isMuted = signal(false);
  isFullscreen = signal(false);

  orientation = computed(() => {
    return this.payload()?.orientation || 'landscape';
  });

  private player: dashjs.MediaPlayerClass | null = null;

  constructor() {
    effect(() => {
      const src = this.src();
      if (src && isPlatformBrowser(this.platformId)) {
        this.loaded.set(false);
        this.updateSrc(src);
      }
    });
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initPlayer();
      this.setupEvents();
    }
  }

  private onLoadedData = () => {
    this.loaded.set(true);
  };

  private onTimeUpdate = () => {
    const videoElement = this.videoElement();
    if (videoElement) {
      this.currentTime.set(videoElement.nativeElement.currentTime);
    }
  };

  private onLoadedMetadata = () => {
    const videoElement = this.videoElement();
    if (videoElement) {
      this.duration.set(videoElement.nativeElement.duration);
    }
  };

  private onPlay = () => {
    this.isPlaying.set(true);
    this.hasStarted.set(true);
  };

  private onPause = () => {
    this.isPlaying.set(false);
  };

  private setupEvents() {
    const videoElement = this.videoElement();
    if (!videoElement || !isPlatformBrowser(this.platformId)) {
      return;
    }

    const nativeElement = videoElement.nativeElement;

    fromEvent(nativeElement, 'loadeddata')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onLoadedData());

    fromEvent(nativeElement, 'canplay')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onLoadedData());

    fromEvent(nativeElement, 'timeupdate')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onTimeUpdate());

    fromEvent(nativeElement, 'loadedmetadata')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onLoadedMetadata());

    fromEvent(nativeElement, 'play')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onPlay());

    fromEvent(nativeElement, 'pause')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onPause());

    fromEvent(this.document, 'fullscreenchange')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFullscreenChange());
  }

  private onFullscreenChange = () => {
    this.isFullscreen.set(!!this.document.fullscreenElement);
  };

  toggleFullscreen() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const container = this.videoElement()?.nativeElement.parentElement;
    if (!container) return;

    if (!this.document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      this.document.exitFullscreen();
    }
  }

  togglePlay() {
    const videoElement = this.videoElement();
    if (videoElement) {
      if (videoElement.nativeElement.paused) {
        videoElement.nativeElement.play();
      } else {
        videoElement.nativeElement.pause();
      }
    }
  }

  seek(event: any) {
    const videoElement = this.videoElement();
    if (videoElement) {
      videoElement.nativeElement.currentTime = event.target.value;
    }
  }

  toggleMute() {
    const videoElement = this.videoElement();
    if (videoElement) {
      videoElement.nativeElement.muted = !videoElement.nativeElement.muted;
      this.isMuted.set(videoElement.nativeElement.muted);
    }
  }

  private async initPlayer() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const videoElement = this.videoElement();

    if (!videoElement) {
      return;
    }

    const src = this.src();
    const payload = this.payload();
    const dashUrl = payload?.dash?.manifest;

    if (!src && !dashUrl) {
      return;
    }

    const finalSrc = dashUrl || src;

    if (finalSrc && finalSrc.endsWith('.mpd')) {
      const dashjs = await import('dashjs');
      this.player = dashjs.MediaPlayer().create();
      this.player.initialize(videoElement.nativeElement, finalSrc, this.autoPlay());
    } else if (finalSrc) {
      videoElement.nativeElement.src = finalSrc;
      videoElement.nativeElement.autoplay = this.autoPlay();
      videoElement.nativeElement.load();
    }
  }

  private updateSrc(src: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.player) {
      this.player.attachSource(src);
    } else {
      const videoElement = this.videoElement();

      if (videoElement) {
        if (src.endsWith('.mpd')) {
          this.initPlayer();
        } else {
          videoElement.nativeElement.src = src;
          videoElement.nativeElement.load();
        }
      }
    }
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
  }
}
