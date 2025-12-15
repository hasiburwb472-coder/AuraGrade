
import { Component, ChangeDetectionStrategy, signal, WritableSignal, viewChild } from '@angular/core';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { ControlsPanelComponent } from './components/controls-panel/controls-panel.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { VectorscopeComponent } from './components/vectorscope/vectorscope.component';

interface Clip {
  name: string;
  duration: number; // in seconds
  thumbnail: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VideoPlayerComponent, ControlsPanelComponent, TimelineComponent, VectorscopeComponent]
})
export class AppComponent {
  videoUrl: WritableSignal<string | null> = signal(null);
  videoFileName: WritableSignal<string> = signal('No video selected');
  appliedCssFilter: WritableSignal<string> = signal('');
  
  clips: WritableSignal<Clip[]> = signal([]);
  
  videoPlayer = viewChild(VideoPlayerComponent);

  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const url = URL.createObjectURL(file);
      this.videoUrl.set(url);
      this.videoFileName.set(file.name);

      // Simulate creating a clip for the timeline
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoElement.src);
        this.clips.set([{
          name: file.name,
          duration: videoElement.duration,
          thumbnail: 'https://picsum.photos/150/80' // Placeholder thumbnail
        }]);
      };
      videoElement.src = url;
    }
  }

  applyFilter(filter: string): void {
    this.appliedCssFilter.set(filter);
  }
}
