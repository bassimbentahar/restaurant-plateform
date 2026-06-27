import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  copyOutline,
  createOutline,
  optionsOutline,
  pricetagOutline,
  refreshOutline,
  timeOutline,
} from 'ionicons/icons';

import {
  AvailabilityEditorResult,
  ChoiceEditorMode,
  ChoiceEditorResult,
  MenuLibraryCard,
  OfferEditorResult,
} from './data-access/menu-library.model';
import { MenuLibraryCardComponent } from './components/menu-library-card/menu-library-card.component';
import { MenuLibraryFacade } from './data-access/menu-library.facade';
import { ChoiceEditorModalComponent } from './modals/choice-editor-modal/choice-editor-modal.component';
import { AvailabilityEditorModalComponent } from './modals/availability-editor-modal/availability-editor-modal.component';
import { OptionGroupLibraryItem } from '../product-wizard/state/product-editor.model';
import { RestaurantRuleResponse } from '../rule/dto/rule-admin.dto';
import {OfferEditorModalComponent} from "./modals/offer-editor-modal/offer-editor-modal.component";

@Component({
  selector: 'app-menu-library-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonButton,
    IonContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    MenuLibraryCardComponent,
  ],
  providers: [MenuLibraryFacade],
  templateUrl: './menu-library-page.component.html',
  styleUrls: ['./menu-library-page.component.scss'],
})
export class MenuLibraryPageComponent implements OnInit {
  readonly facade = inject(MenuLibraryFacade);

  private readonly modalController = inject(ModalController);

  constructor() {
    addIcons({
      addCircleOutline,
      copyOutline,
      createOutline,
      optionsOutline,
      pricetagOutline,
      refreshOutline,
      timeOutline,
    });
  }

  ngOnInit(): void {
    void this.facade.load();
  }

  createCurrentType(): void {
    switch (this.facade.selectedTab()) {
      case 'choices':
        void this.openChoiceEditor('create');
        return;

      case 'offers':
        void this.openOfferEditor();
        return;

      case 'availability':
        void this.openAvailabilityEditor();
        return;
    }
  }

  editCard(card: MenuLibraryCard): void {
    switch (card.kind) {
      case 'choice': {
        const choice = this.facade.findChoiceById(card.id);

        if (choice) {
          void this.openChoiceEditor('edit', choice);
        }

        return;
      }

      case 'offer': {
        const rule = this.facade.findRuleById(card.id);

        if (rule) {
          void this.openOfferEditor(rule);
        }

        return;
      }

      case 'availability': {
        const rule = this.facade.findRuleById(card.id);

        if (rule) {
          void this.openAvailabilityEditor(rule);
        }

        return;
      }
    }
  }

  duplicateCard(card: MenuLibraryCard): void {
    switch (card.kind) {
      case 'choice': {
        const choice = this.facade.findChoiceById(card.id);

        if (choice) {
          void this.openChoiceEditor('duplicate', choice);
        }

        return;
      }

      case 'offer': {
        const rule = this.facade.findRuleById(card.id);

        if (rule) {
          void this.openOfferEditor(rule, true);
        }

        return;
      }

      case 'availability': {
        const rule = this.facade.findRuleById(card.id);

        if (rule) {
          void this.openAvailabilityEditor(rule, true);
        }

        return;
      }
    }
  }

  private async openChoiceEditor(
    mode: ChoiceEditorMode,
    choice: OptionGroupLibraryItem | null = null
  ): Promise<void> {
    const modal = await this.modalController.create({
      component: ChoiceEditorModalComponent,
      componentProps: {
        mode,
        choice,
      },
      cssClass: 'choice-editor-modal-shell',
    });

    await modal.present();

    const result = await modal.onDidDismiss<ChoiceEditorResult>();

    if (result.role === 'saved' && result.data) {
      await this.facade.saveChoice(result.data);
    }
  }

  private async openOfferEditor(
    rule: RestaurantRuleResponse | null = null,
    duplicate = false
  ): Promise<void> {
    const modal = await this.modalController.create({
      component: OfferEditorModalComponent,
      componentProps: {
        rule,
        duplicate,
      },
      cssClass: 'rule-editor-modal-shell',
    });

    await modal.present();

    const result = await modal.onDidDismiss<OfferEditorResult>();

    if (result.role === 'saved' && result.data) {
      await this.facade.saveOffer(result.data);
    }
  }

  private async openAvailabilityEditor(
    rule: RestaurantRuleResponse | null = null,
    duplicate = false
  ): Promise<void> {
    const modal = await this.modalController.create({
      component: AvailabilityEditorModalComponent,
      componentProps: {
        rule,
        duplicate,
      },
      cssClass: 'rule-editor-modal-shell',
    });

    await modal.present();

    const result = await modal.onDidDismiss<AvailabilityEditorResult>();

    if (result.role === 'saved' && result.data) {
      await this.facade.saveAvailability(result.data);
    }
  }
}
