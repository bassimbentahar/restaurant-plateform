import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonRange,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

type Point = {
  x: number;
  y: number;
};

@Component({
  selector: 'app-product-image-cropper-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    IonButton,
    IonRange,
    IonSpinner,
    IonText,
    TranslatePipe,
  ],
  templateUrl: './product-image-cropper.modal.html',
  styleUrl: './product-image-cropper.modal.scss',
})
export class ProductImageCropperModal implements AfterViewInit, OnDestroy {
  @Input() file!: File;
  @Input() outputWidth = 1200;
  @Input() outputHeight = 900;
  @Input() outputMimeType = 'image/webp';
  @Input() outputQuality = 0.9;

  @ViewChild('cropFrame') cropFrame?: ElementRef<HTMLDivElement>;

  private readonly modalController = inject(ModalController);

  readonly loading = signal(true);
  readonly imageUrl = signal('');
  readonly zoom = signal(1);
  readonly imageStyle = signal<Record<string, string>>({});

  private sourceImage = new Image();
  private objectUrl: string | null = null;

  private naturalWidth = 0;
  private naturalHeight = 0;

  private frameWidth = 0;
  private frameHeight = 0;

  private imageWidth = 0;
  private imageHeight = 0;
  private currentScale = 1;

  private position = signal<Point>({ x: 0, y: 0 });

  private dragging = false;
  private dragStartPointer: Point = { x: 0, y: 0 };
  private dragStartPosition: Point = { x: 0, y: 0 };

  private readonly resizeHandler = () => {
    this.updateLayout();
  };

  ngAfterViewInit(): void {
    window.addEventListener('resize', this.resizeHandler);
    this.loadImage();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  cancel(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  async confirm(): Promise<void> {
    if (!this.sourceImage || !this.naturalWidth || !this.naturalHeight) {
      return;
    }

    this.updateLayout();

    const crop = this.computeSourceCrop();

    const canvas = document.createElement('canvas');
    canvas.width = this.outputWidth;
    canvas.height = this.outputHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    context.drawImage(
      this.sourceImage,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      this.outputWidth,
      this.outputHeight
    );

    const blob = await this.canvasToBlob(canvas);

    const croppedFile = new File(
      [blob],
      this.createOutputFilename(),
      {
        type: blob.type || this.outputMimeType,
        lastModified: Date.now(),
      }
    );

    await this.modalController.dismiss(croppedFile, 'confirm');
  }

  onPointerDown(event: PointerEvent): void {
    if (this.loading()) {
      return;
    }

    event.preventDefault();

    this.dragging = true;
    this.dragStartPointer = {
      x: event.clientX,
      y: event.clientY,
    };
    this.dragStartPosition = this.position();

    this.cropFrame?.nativeElement.setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - this.dragStartPointer.x;
    const deltaY = event.clientY - this.dragStartPointer.y;

    this.setPositionClamped(
      this.dragStartPosition.x + deltaX,
      this.dragStartPosition.y + deltaY
    );
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;

    try {
      this.cropFrame?.nativeElement.releasePointerCapture(event.pointerId);
    } catch {
      // pointer already released
    }
  }

  onZoomChange(value: number | { lower: number; upper: number } | null | undefined): void {
    if (typeof value !== 'number') {
      return;
    }

    this.zoom.set(value);
    this.updateLayout();
  }

  resetCrop(): void {
    this.zoom.set(1);
    this.position.set({ x: 0, y: 0 });
    this.updateLayout();
  }

  private loadImage(): void {
    if (!this.file) {
      this.loading.set(false);
      return;
    }

    this.objectUrl = URL.createObjectURL(this.file);
    this.imageUrl.set(this.objectUrl);

    this.sourceImage = new Image();

    this.sourceImage.onload = () => {
      this.naturalWidth = this.sourceImage.naturalWidth;
      this.naturalHeight = this.sourceImage.naturalHeight;

      this.loading.set(false);

      setTimeout(() => {
        this.resetCrop();
      });
    };

    this.sourceImage.onerror = () => {
      this.loading.set(false);
    };

    this.sourceImage.src = this.objectUrl;
  }

  private updateLayout(): void {
    const frame = this.cropFrame?.nativeElement;

    if (!frame || !this.naturalWidth || !this.naturalHeight) {
      return;
    }

    const rect = frame.getBoundingClientRect();

    this.frameWidth = rect.width;
    this.frameHeight = rect.height;

    const coverScale = Math.max(
      this.frameWidth / this.naturalWidth,
      this.frameHeight / this.naturalHeight
    );

    this.currentScale = coverScale * this.zoom();

    this.imageWidth = this.naturalWidth * this.currentScale;
    this.imageHeight = this.naturalHeight * this.currentScale;

    const currentPosition = this.position();

    this.setPositionClamped(
      currentPosition.x,
      currentPosition.y
    );
  }

  private setPositionClamped(x: number, y: number): void {
    const maxX = Math.max(0, (this.imageWidth - this.frameWidth) / 2);
    const maxY = Math.max(0, (this.imageHeight - this.frameHeight) / 2);

    const nextPosition = {
      x: this.clamp(x, -maxX, maxX),
      y: this.clamp(y, -maxY, maxY),
    };

    this.position.set(nextPosition);
    this.updateImageStyle();
  }

  private updateImageStyle(): void {
    const position = this.position();

    const left = (this.frameWidth - this.imageWidth) / 2 + position.x;
    const top = (this.frameHeight - this.imageHeight) / 2 + position.y;

    this.imageStyle.set({
      width: `${this.imageWidth}px`,
      height: `${this.imageHeight}px`,
      transform: `translate(${left}px, ${top}px)`,
    });
  }

  private computeSourceCrop(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const position = this.position();

    const left = (this.frameWidth - this.imageWidth) / 2 + position.x;
    const top = (this.frameHeight - this.imageHeight) / 2 + position.y;

    const width = this.frameWidth / this.currentScale;
    const height = this.frameHeight / this.currentScale;

    const x = this.clamp(
      (0 - left) / this.currentScale,
      0,
      Math.max(0, this.naturalWidth - width)
    );

    const y = this.clamp(
      (0 - top) / this.currentScale,
      0,
      Math.max(0, this.naturalHeight - height)
    );

    return {
      x,
      y,
      width,
      height,
    };
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Unable to export cropped image'));
            return;
          }

          resolve(blob);
        },
        this.outputMimeType,
        this.outputQuality
      );
    });
  }

  private createOutputFilename(): string {
    const originalName = this.file?.name ?? 'product-image';
    const baseName = originalName
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${baseName || 'product-image'}-cropped.webp`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
