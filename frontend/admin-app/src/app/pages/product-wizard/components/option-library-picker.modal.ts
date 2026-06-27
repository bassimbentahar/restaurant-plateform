import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  closeOutline,
  libraryOutline,
  searchOutline,
} from 'ionicons/icons';
import {OptionGroupLibraryItem} from '../state/product-editor.model';


@Component({
  selector: 'app-option-library-picker-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    TranslatePipe,
  ],
  templateUrl: './option-library-picker.modal.html',
  styleUrl: './option-library-picker.modal.scss',
})
export class OptionLibraryPickerModal {
  @Input() choices: OptionGroupLibraryItem[] = [];

  readonly searchTerm = signal('');

  readonly filteredChoices = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    if (!search) {
      return this.choices;
    }

    return this.choices.filter((choice) => {
      const nameMatches = choice.name.toLowerCase().includes(search);

      const descriptionMatches =
        choice.description?.toLowerCase().includes(search) ?? false;

      const itemMatches = choice.items.some((item) =>
        item.name.toLowerCase().includes(search)
      );

      return nameMatches || descriptionMatches || itemMatches;
    });
  });

  constructor(private readonly modalController: ModalController) {
    addIcons({
      addCircleOutline,
      closeOutline,
      libraryOutline,
      searchOutline,
    });
  }

  updateSearchTerm(value: string | null | undefined): void {
    this.searchTerm.set(String(value ?? ''));
  }

  selectChoice(choice: OptionGroupLibraryItem): void {
    this.modalController.dismiss(
      {
        optionGroupId: choice.id,
      },
      'selected'
    );
  }

  createCustomChoice(): void {
    this.modalController.dismiss(null, 'create-custom');
  }

  close(): void {
    this.modalController.dismiss(null, 'cancel');
  }

  trackById = (_: number, item: OptionGroupLibraryItem): string => item.id;
}
