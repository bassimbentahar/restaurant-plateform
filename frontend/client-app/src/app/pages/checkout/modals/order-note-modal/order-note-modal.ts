import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

export interface OrderNoteModalResult {
  note: string;
}

@Component({
  selector: 'app-order-note-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
  ],
  templateUrl: './order-note-modal.html',
  styleUrl: './order-note-modal.scss',
})
export class OrderNoteModal {
  private readonly fb = inject(FormBuilder);
  private readonly modalCtrl = inject(ModalController);

  @Input() note = '';

  readonly form = this.fb.nonNullable.group({
    note: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnInit(): void {
    this.form.patchValue({
      note: this.note ?? '',
    });
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  clear(): void {
    this.modalCtrl.dismiss({ note: '' }, 'save');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.modalCtrl.dismiss(this.form.getRawValue(), 'save');
  }

  hasMaxLengthError(): boolean {
    const control = this.form.controls.note;
    return control.touched && !!control.errors?.['maxlength'];
  }
}
