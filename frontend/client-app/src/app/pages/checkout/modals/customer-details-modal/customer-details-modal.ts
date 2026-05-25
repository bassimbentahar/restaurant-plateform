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
import {swissPhoneValidator} from "../../../../validators/swiss-phone.validator";
import {TranslatePipe} from "@ngx-translate/core";

export interface CustomerDetailsModal {
  firstname: string;
  lastname: string;
  phone: string;
}

@Component({
  selector: 'app-customer-details-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonIcon,
    TranslatePipe,
  ],
  templateUrl: './customer-details-modal.html',
  styleUrl: './customer-details-modal.scss',
})
export class CustomerDetailsModal {
  private readonly fb = inject(FormBuilder);
  private readonly modalCtrl = inject(ModalController);

  @Input() firstname = '';
  @Input() lastname = '';
  @Input() phone = '';

  readonly form = this.fb.nonNullable.group({
    firstname: ['', [Validators.required, Validators.minLength(2)]],
    lastname: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, swissPhoneValidator()]],
  });

  constructor() {
    addIcons({ closeOutline });
  }

  ngOnInit(): void {
    this.form.patchValue({
      firstname: this.firstname ?? '',
      lastname: this.lastname ?? '',
      phone: this.phone ?? '',
    });
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.modalCtrl.dismiss(this.form.getRawValue(), 'save');
  }

  formatSwissPhone(): void {
    const raw = this.form.controls.phone.value;
    const digits = raw.replace(/\D/g, '');

    let formatted = raw;

    if (digits.startsWith('41') && digits.length === 11) {
      formatted = `+41 ${digits.slice(2, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
    } else if (digits.startsWith('0') && digits.length === 10) {
      formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
    }

    this.form.controls.phone.setValue(formatted, { emitEvent: false });
  }

  hasPhoneError(): boolean {
    const control = this.form.controls.phone;

    return control.touched && !!control.errors?.['swissPhone'];
  }

  hasPhoneRequiredError(): boolean {
    const control = this.form.controls.phone;

    return control.touched && !!control.errors?.['required'];
  }
}
