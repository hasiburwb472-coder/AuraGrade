
import { Component, ChangeDetectionStrategy, input, effect, viewChild, ElementRef, signal, HostListener, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-video-player',
  host: {
    '(mouseenter)': 'showControls.set(true)',
    '(mouseleave)': 'showControls.set(false)',
  },
  templateUrl: './video-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent {
  videoSrc = input.required<string | null>();
  cssFilter = input<string>('');
  
  videoElement = viewChild.required<ElementRef<HTMLVideoElement>>('videoPlayer');
  
  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  showControls = signal(false);
  playbackRate = signal(1);
  playbackRates = [0.5, 1, 1.5, 2];

  constructor() {
    effect(() => {
      const video = this.videoElement()?.nativeElement;
      if (video) {
        video.style.filter = this.cssFilter();
      }
    });

    afterNextRender(() => {
        const video = this.videoElement().nativeElement;
        video.addEventListener('loadedmetadata', this.updateVideoMetadata.bind(this));
        video.addEventListener('timeupdate', this.updateCurrentTime.bind(this));
        video.addEventListener('play', () => this.isPlaying.set(true));
        video.addEventListener('pause', () => this.isPlaying.set(false));
    });
  }

  updateVideoMetadata() {
    this.duration.set(this.videoElement().nativeElement.duration);
  }

  updateCurrentTime() {
    this.currentTime.set(this.videoElement().nativeElement.currentTime);
  }

  togglePlay() {
    const video = this.videoElement().nativeElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  onSeek(event: Event) {
    const input = event.target as HTMLInputElement;
    this.videoElement().nativeElement.currentTime = Number(input.value);
  }

  formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  setPlaybackRate(rate: number) {
    this.playbackRate.set(rate);
    this.videoElement().nativeElement.playbackRate = rate;
  }
}
