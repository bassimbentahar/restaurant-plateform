import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

import { MenuLibraryCard } from '../../data-access/menu-library.model';

@Component({
  selector: 'app-menu-library-card',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    IonBadge,
    IonButton,
    IonIcon,
  ],
  templateUrl: './menu-library-card.component.html',
  styleUrls: ['./menu-library-card.component.scss'],
})
export class MenuLibraryCardComponent {
  readonly card = input.required<MenuLibraryCard>();

  readonly edit = output<MenuLibraryCard>();
  readonly duplicate = output<MenuLibraryCard>();

  isTranslationKey(value: string | number): value is string {
    return typeof value === 'string' && value.startsWith('adminMenuLibrary.');
  }
}
