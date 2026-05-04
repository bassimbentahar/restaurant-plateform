import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, chevronDownOutline } from 'ionicons/icons';
import {
  DeliverySlotDay,
} from '../../../../models/delivery-slots.model';
import {DeliverySlotService} from "../../../../services/DeliverySlotService";

export interface DeliveryTimeResult {
  type: 'ASAP' | 'SCHEDULED';
  date?: string;
  time?: string;
  label: string;
}

@Component({
  selector: 'app-delivery-time-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
  templateUrl: './delivery-time-modal.html',
  styleUrl: './delivery-time-modal.scss',
})
export class DeliveryTimeModal {
  private readonly modalCtrl = inject(ModalController);
  private readonly deliverySlotService = inject(DeliverySlotService);

  @Input() orderType: 'DELIVERY' | 'PICKUP' = 'DELIVERY';
  @Input() selectedType: 'ASAP' | 'SCHEDULED' = 'ASAP';
  @Input() initialDate: string | null = null;
  @Input() initialTime: string | null = null;

  readonly loading = signal(false);
  readonly type = signal<'ASAP' | 'SCHEDULED'>('ASAP');

  readonly slotDays = signal<DeliverySlotDay[]>([]);
  readonly selectedDate = signal<string | null>(null);
  readonly selectedTime = signal<string | null>(null);

  constructor() {
    addIcons({ closeOutline, chevronDownOutline });
  }

  ngOnInit(): void {
    this.type.set(this.selectedType ?? 'ASAP');
    this.selectedDate.set(this.initialDate);
    this.selectedTime.set(this.initialTime);

    this.loadSlots();
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  chooseAsap(): void {
    this.type.set('ASAP');
  }

  chooseScheduled(): void {
    this.type.set('SCHEDULED');

    if (!this.selectedDate() || !this.selectedTime()) {
      this.selectFirstAvailableSlot();
    }
  }

  chooseDate(date: string): void {
    const day = this.slotDays().find(d => d.date === date);

    if (!day || day.disabled) {
      return;
    }

    this.type.set('SCHEDULED');
    this.selectedDate.set(date);

    const firstAvailableSlot = day.slots.find(slot => !slot.disabled);
    this.selectedTime.set(firstAvailableSlot?.time ?? null);
  }

  chooseTime(time: string): void {
    const day = this.selectedDay();
    const slot = day?.slots.find(s => s.time === time);

    if (!slot || slot.disabled) {
      return;
    }

    this.type.set('SCHEDULED');
    this.selectedTime.set(time);
  }

  selectedDay(): DeliverySlotDay | undefined {
    return this.slotDays().find(day => day.date === this.selectedDate());
  }

  save(): void {
    if (this.type() === 'ASAP') {
      const result: DeliveryTimeResult = {
        type: 'ASAP',
        label: 'Dès que possible',
      };

      this.modalCtrl.dismiss(result, 'save');
      return;
    }

    const day = this.selectedDay();
    const slot = day?.slots.find(s => s.time === this.selectedTime());

    if (!day || !slot || slot.disabled) {
      return;
    }

    const result: DeliveryTimeResult = {
      type: 'SCHEDULED',
      date: day.date,
      time: slot.time,
      label: `${day.label} à ${slot.label}`,
    };

    this.modalCtrl.dismiss(result, 'save');
  }

  private loadSlots(): void {
    this.loading.set(true);

    this.deliverySlotService.getSlots(this.orderType).subscribe({
      next: (days) => {
        this.slotDays.set(days);

        const hasSelectedSlot = this.hasAvailableSelectedSlot();

        if (!hasSelectedSlot) {
          this.selectFirstAvailableSlot();
        }

        this.loading.set(false);
      },
      error: () => {
        this.slotDays.set([]);
        this.selectedDate.set(null);
        this.selectedTime.set(null);
        this.loading.set(false);
      },
    });
  }

  private selectFirstAvailableSlot(): void {
    const firstAvailableDay = this.slotDays().find(day =>
      !day.disabled && day.slots.some(slot => !slot.disabled)
    );

    const firstAvailableSlot = firstAvailableDay?.slots.find(slot => !slot.disabled);

    this.selectedDate.set(firstAvailableDay?.date ?? null);
    this.selectedTime.set(firstAvailableSlot?.time ?? null);
  }

  private hasAvailableSelectedSlot(): boolean {
    const day = this.slotDays().find(d => d.date === this.selectedDate());
    const slot = day?.slots.find(s => s.time === this.selectedTime());

    return !!day && !day.disabled && !!slot && !slot.disabled;
  }

  availableSlots() {
    return this.selectedDay()?.slots.filter(slot => !slot.disabled) ?? [];
  }
}
