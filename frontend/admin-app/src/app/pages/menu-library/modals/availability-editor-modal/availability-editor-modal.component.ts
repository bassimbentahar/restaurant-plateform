import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToggle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeOutline } from 'ionicons/icons';

import {
  AvailabilityEditorResult,
  AvailabilityEditorType,
} from '../../data-access/menu-library.model';
import { RestaurantRuleResponse } from '../../../rule/dto/rule-admin.dto';

@Component({
  selector: 'app-availability-editor-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonToggle,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
  ],
  templateUrl: './availability-editor-modal.component.html',
  styleUrls: ['./availability-editor-modal.component.scss'],
})
export class AvailabilityEditorModalComponent implements OnInit {
  @Input() rule: RestaurantRuleResponse | null = null;
  @Input() duplicate = false;

  readonly days = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  readonly name = signal('');
  readonly description = signal('');
  readonly type = signal<AvailabilityEditorType>('AVAILABILITY');
  readonly active = signal(true);
  readonly favorite = signal(false);
  readonly customerVisible = signal(false);
  readonly customerTitle = signal('');
  readonly customerDescription = signal('');
  readonly tags = signal('');
  readonly timeFrom = signal('');
  readonly timeTo = signal('');
  readonly orderType = signal('');
  readonly selectedDays = signal<string[]>([]);
  readonly available = signal(true);
  readonly visible = signal(true);
  readonly submitted = signal(false);

  readonly isValid = computed(() => this.name().trim().length > 0);

  constructor(private readonly modalController: ModalController) {
    addIcons({
      checkmarkCircleOutline,
      closeOutline,
    });
  }

  ngOnInit(): void {
    if (!this.rule) {
      return;
    }

    this.name.set(
      this.duplicate
        ? `${this.rule.name} - copie`
        : this.rule.name
    );

    this.description.set(this.rule.description ?? '');
    this.type.set(this.normalizeType(this.rule.type));
    this.active.set(this.rule.active);
    this.favorite.set(this.rule.favorite);
    this.customerVisible.set(this.rule.customerVisible);
    this.customerTitle.set(this.rule.customerTitle ?? '');
    this.customerDescription.set(this.rule.customerDescription ?? '');
    this.tags.set((this.rule.tags ?? []).map((tag) => tag.name).join(', '));
    this.timeFrom.set(this.rule.condition?.timeFrom ?? '');
    this.timeTo.set(this.rule.condition?.timeTo ?? '');
    this.orderType.set(this.rule.condition?.orderType ?? '');
    this.selectedDays.set(this.rule.condition?.daysOfWeek ?? []);
    this.available.set(this.rule.action?.available ?? true);
    this.visible.set(this.rule.action?.visible ?? true);
  }

  updateName(value: string | number | null | undefined): void {
    this.name.set(String(value ?? ''));
  }

  updateDescription(value: string | number | null | undefined): void {
    this.description.set(String(value ?? ''));
  }

  updateType(value: string | number | null | undefined): void {
    this.type.set(this.normalizeType(String(value ?? 'AVAILABILITY')));
  }

  updateTags(value: string | number | null | undefined): void {
    this.tags.set(String(value ?? ''));
  }

  updateTimeFrom(value: string | number | null | undefined): void {
    this.timeFrom.set(String(value ?? ''));
  }

  updateTimeTo(value: string | number | null | undefined): void {
    this.timeTo.set(String(value ?? ''));
  }

  updateOrderType(value: string | number | null | undefined): void {
    this.orderType.set(String(value ?? ''));
  }

  toggleDay(day: string, checked: boolean): void {
    const selectedDays = this.selectedDays();

    this.selectedDays.set(
      checked
        ? [...selectedDays, day]
        : selectedDays.filter((selectedDay) => selectedDay !== day)
    );
  }

  isDaySelected(day: string): boolean {
    return this.selectedDays().includes(day);
  }

  confirm(): void {
    this.submitted.set(true);

    if (!this.isValid()) {
      return;
    }

    const result: AvailabilityEditorResult = {
      id: this.duplicate ? undefined : this.rule?.id,
      name: this.name().trim(),
      description: this.toOptionalText(this.description()),
      type: this.type(),
      active: this.active(),
      favorite: this.favorite(),
      customerVisible: this.customerVisible(),
      customerTitle: this.toOptionalText(this.customerTitle()),
      customerDescription: this.toOptionalText(this.customerDescription()),
      tags: this.toTags(this.tags()),
      daysOfWeek: this.selectedDays(),
      timeFrom: this.toOptionalText(this.timeFrom()),
      timeTo: this.toOptionalText(this.timeTo()),
      orderType: this.toOptionalText(this.orderType()),
      available: this.available(),
      visible: this.visible(),
    };

    this.modalController.dismiss(result, 'saved');
  }

  close(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  private normalizeType(type: string): AvailabilityEditorType {
    if (type === 'AVAILABILITY' || type === 'VISIBILITY') {
      return type;
    }

    return 'AVAILABILITY';
  }

  private toOptionalText(value: string): string | undefined {
    const cleaned = value.trim();

    return cleaned ? cleaned : undefined;
  }

  private toTags(value: string): string[] {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
}
