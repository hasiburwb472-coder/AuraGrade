
import { Component, ChangeDetectionStrategy, input, viewChild, ElementRef, afterNextRender, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-vectorscope',
  templateUrl: './vectorscope.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VectorscopeComponent implements OnDestroy {
  videoElement = input<HTMLVideoElement | undefined>();
  canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('vectorscopeCanvas');

  private ctx!: CanvasRenderingContext2D;
  private offscreenCanvas!: HTMLCanvasElement;
  private offscreenCtx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private size = 256;

  constructor() {
    afterNextRender(() => this.setupCanvas());
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private setupCanvas(): void {
    const canvasEl = this.canvas().nativeElement;
    this.ctx = canvasEl.getContext('2d', { willReadFrequently: true })!;
    canvasEl.width = this.size;
    canvasEl.height = this.size;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true })!;

    if (this.videoElement()) {
      this.animationFrameId = requestAnimationFrame(this.drawVectorscope.bind(this));
    }
  }

  private drawVectorscope(): void {
    const video = this.videoElement();
    if (!video || video.paused || video.ended) {
      this.animationFrameId = requestAnimationFrame(this.drawVectorscope.bind(this));
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    this.offscreenCanvas.width = videoWidth;
    this.offscreenCanvas.height = videoHeight;

    this.ctx.clearRect(0, 0, this.size, this.size);
    this.drawGraticule();
    
    this.offscreenCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
    const imageData = this.offscreenCtx.getImageData(0, 0, videoWidth, videoHeight);
    const data = imageData.data;

    const center = this.size / 2;
    this.ctx.fillStyle = 'rgba(173, 216, 230, 0.5)'; // Light blue dots

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Simplified RGB to YUV conversion
      const u = -0.14713 * r - 0.28886 * g + 0.436 * b;
      const v = 0.615 * r - 0.51499 * g - 0.10001 * b;

      const x = center + u;
      const y = center - v;

      this.ctx.fillRect(x, y, 1, 1);
    }

    this.animationFrameId = requestAnimationFrame(this.drawVectorscope.bind(this));
  }

  private drawGraticule(): void {
    const center = this.size / 2;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;

    // Circles
    this.ctx.beginPath();
    this.ctx.arc(center, center, center * 0.25, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(center, center, center * 0.5, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.arc(center, center, center * 0.75, 0, Math.PI * 2);
    this.ctx.stroke();

    // Crosshairs
    this.ctx.beginPath();
    this.ctx.moveTo(0, center);
    this.ctx.lineTo(this.size, center);
    this.ctx.moveTo(center, 0);
    this.ctx.lineTo(center, this.size);
    this.ctx.stroke();
    
    // Color target labels
    this.ctx.font = '10px sans-serif';
    this.ctx.fillText('R', 135, 30);
    this.ctx.fillText('Mg', 215, 75);
    this.ctx.fillText('B', 225, 175);
    this.ctx.fillText('Cy', 115, 230);
    this.ctx.fillText('G', 20, 175);
    this.ctx.fillText('Yl', 25, 75);
  }
}
