import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkmarkCircle,
  createOutline,
  locationOutline,
  starOutline,
  trashOutline,
  closeOutline,
} from 'ionicons/icons';

import { AddressService } from '../../../../services/AddressService';
import { UserAddress, UserAddressRequest } from '../../../../models/user-address.model';
import {AddressModal} from "../../../address-modal/address-modal";

@Component({
  selector: 'app-checkout-address-modal',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
  templateUrl: './checkout-address-modal.html',
  styleUrl: './checkout-address-modal.scss',
})
export class CheckoutAddressModal {
  private readonly modalCtrl = inject(ModalController);
  private readonly addressService = inject(AddressService);
  private readonly toastCtrl = inject(ToastController);

  readonly addresses = signal<UserAddress[]>([]);
  readonly loading = signal(false);
  readonly selectedAddressId = signal<string | null>(null);

  constructor() {
    addIcons({
      addOutline,
      checkmarkCircle,
      createOutline,
      locationOutline,
      starOutline,
      trashOutline,
      closeOutline,
    });
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.loading.set(true);

    this.addressService.loadAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);

        const defaultAddress = addresses.find(a => a.defaultAddress) ?? addresses[0];

        if (defaultAddress) {
          this.selectedAddressId.set(defaultAddress.id);
        }

        this.loading.set(false);
      },
      error: async () => {
        this.loading.set(false);
        await this.showToast('Impossible de charger les adresses.', 'danger');
      },
    });
  }

  select(address: UserAddress): void {
    this.selectedAddressId.set(address.id);
  }

  confirm(): void {
    const selected = this.addresses().find(a => a.id === this.selectedAddressId());

    if (!selected) {
      return;
    }

    this.modalCtrl.dismiss(selected, 'select');
  }

  close(): void {
    if (this.addresses().length === 0) {
      this.modalCtrl.dismiss(null, 'empty');
      return;
    }
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async openCreateAddress(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddressModal,
      cssClass: 'checkout-modal',
      componentProps: {
        fromUpdate: false,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss<UserAddressRequest>();
    if (!data) {
      return;
    }

    this.addressService.create(data).subscribe({
      next: (created) => {
        this.selectedAddressId.set(created.id);
        this.loadAddresses();
      },
    });
  }

  async openEditAddress(address: UserAddress, event: Event): Promise<void> {
    event.stopPropagation();

    const modal = await this.modalCtrl.create({
      component: AddressModal,
      cssClass: 'checkout-modal',
      componentProps: {
        fromUpdate: true,
        addressToUpdate: address,
      },
    });

    await modal.present();

    const { data } = await modal.onWillDismiss<UserAddressRequest>();

    if (!data) {
      return;
    }

    this.addressService.update(address.id, data).subscribe({
      next: () => this.loadAddresses(),
    });
  }

  setDefault(address: UserAddress, event: Event): void {
    event.stopPropagation();

    if (address.defaultAddress) {
      return;
    }

    this.addressService.setDefault(address.id).subscribe({
      next: () => this.loadAddresses(),
    });
  }

  async delete(address: UserAddress, event: Event): Promise<void> {
    event.stopPropagation();

    this.addressService.delete(address.id).subscribe({
      next: () => {
        if (this.selectedAddressId() === address.id) {
          this.selectedAddressId.set(null);
        }

        this.loadAddresses();
      },
    });
  }

  formatAddress(address: UserAddress): string {
    return [
      address.street,
      address.streetNumber,
      address.postalCode,
      address.city,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'top',
      color,
    });

    await toast.present();
  }
}
