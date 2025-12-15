
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

interface Clip {
  name: string;
  duration: number;
  thumbnail: string;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  clips = input.required<Clip[]>();
}
