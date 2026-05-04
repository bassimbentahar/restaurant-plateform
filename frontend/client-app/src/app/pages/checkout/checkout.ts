import { CommonModule } from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  cardOutline,
  cashOutline,
  checkmarkCircleOutline,
  homeOutline,
  informationCircleOutline,
  locationOutline,
  receiptOutline,
  timeOutline,
} from 'ionicons/icons';
import { CartService } from '../../services/cart.service';
import {CustomerDetailsModal} from "./modals/customer-details-modal/customer-details-modal";
import {UserService} from "../../services/user.service";
import {AddressService} from "../../services/AddressService";
import {DeliveryValidationResponse, UserAddress} from "../../models/user-address.model";
import {CheckoutAddressModal} from "./modals/checkout-address-modal/checkout-address-modal";
import {modalEnterAnimation, modalLeaveAnimation} from "../../animations/modal.animations";
import {DeliveryTimeModal, DeliveryTimeResult} from "./modals/delivery-time-modal/delivery-time-modal";
import {RestaurantDeliveryService} from "../../services/RestaurantDeliveryService";
import {OrderNoteModal, OrderNoteModalResult} from "./modals/order-note-modal/order-note-modal";

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonRadioGroup,
    IonRadio,
    IonButton,
    IonIcon
  ],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly modalCtrl = inject(ModalController);
  private readonly userService = inject(UserService);
  private readonly addressService = inject(AddressService);
  private readonly restaurantDeliveryService = inject(RestaurantDeliveryService);

  //TODO séparer par restaurant
  restaurantId = "01000000-0000-0000-0000-000000000001";
  readonly deliveryTimeLabel = signal('Dès que possible');
  readonly scheduledDate = signal<string | null>(null);
  readonly scheduledTime = signal<string | null>(null);

  readonly selectedAddress = signal<UserAddress | null>(null);
  readonly deliveryValidation = signal<DeliveryValidationResponse | null>(null);
  readonly deliveryFeeValue = signal(0);
  readonly orderType = signal<'DELIVERY' | 'PICKUP'>('DELIVERY');

  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly count = this.cartService.count;

  readonly serviceFee = computed(() => this.subtotal() * 0.06);
  readonly deliveryFee = computed(() => {
    if (this.orderType() !== 'DELIVERY') {
      return 0;
    }

    return this.deliveryFeeValue();
  });

  readonly cannotSubmit = computed(() => {
    const isDelivery = this.orderType() === 'DELIVERY';
    const validation = this.deliveryValidation();
    const hasPhone = !!this.form.controls.phone.value?.trim();

    return this.form.invalid ||
      !hasPhone ||
      this.items().length === 0 ||
      (isDelivery && (!validation || !validation.deliverable));
  });

  readonly total = computed(() => {
    return this.subtotal() + this.serviceFee() + this.deliveryFee();
  });

  readonly loading = false;

  readonly form = this.fb.nonNullable.group({
    orderType: ['DELIVERY', Validators.required],
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    address: [''],
    deliveryTime: ['ASAP', Validators.required],
    paymentMethod: ['TWINT', Validators.required],
    note: [''],
  });

  constructor() {
    addIcons({
      receiptOutline,
      locationOutline,
      homeOutline,
      timeOutline,
      cardOutline,
      cashOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      informationCircleOutline,
    });
  }

  ngOnInit(): void {
    if (this.items().length === 0) {
      this.router.navigate(['/home']);
      return;
    }

    // USER
    this.userService.loadMe().subscribe(user => {
      this.form.patchValue({
        firstname: user.firstname ?? '',
        lastname: user.lastname ?? '',
        phone: user.phone ?? '',
      });
    });

    this.form.controls.orderType.valueChanges.subscribe((type) => {
      this.orderType.set(type as 'DELIVERY' | 'PICKUP');

      if (type === 'PICKUP') {
        this.deliveryValidation.set(null);
        this.deliveryFeeValue.set(0);
        this.form.patchValue({ address: '' });
        return;
      }

      const address = this.selectedAddress();

      if (address) {
        this.form.patchValue({
          address: this.formatAddress(address),
        });

        this.validateDeliveryAddress(address);
      }
    });
    // ADDRESS
    this.addressService.loadAddresses().subscribe({
      next: (addresses) => {

        const defaultAddress = addresses.find(a => a.defaultAddress) ?? addresses[0];

        if (!defaultAddress) {
          return;
        }

        this.selectedAddress.set(defaultAddress);

        this.form.patchValue({
          address: this.formatAddress(defaultAddress),
        });

        this.validateDeliveryAddress(defaultAddress);
      },
      error: (error) => {
        console.error('FAILED TO LOAD ADDRESSES', error);
      },
    });
  }

  submitOrder(): void {
    if (this.cannotSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    const request = {
      ...this.form.getRawValue(),
      items: this.items().map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        deliveryTimeType: this.form.controls.deliveryTime.value,
        scheduledDate: this.scheduledDate(),
        scheduledTime: this.scheduledTime(),
        quantity: item.quantity,

        selectedVariant: item.selectedVariant
          ? {
            variantId: item.selectedVariant.variantId,
            variantName: item.selectedVariant.variantName,
            basePrice: item.selectedVariant.basePrice,
          }
          : null,

        selectedOptions: item.selectedOptions.map((option) => ({
          optionGroupId: option.optionGroupId,
          optionGroupName: option.optionGroupName,
          optionId: option.optionId,
          optionName: option.optionName,
          priceDelta: option.priceDelta,
        })),

        baseUnitPrice: item.baseUnitPrice,
        unitFinalPrice: item.unitFinalPrice,
        lineTotalPrice: item.lineTotalPrice,

        specialInstructions: item.specialInstructions ?? '',
      })),
      subtotal: this.subtotal(),
      serviceFee: this.serviceFee(),
      deliveryFee: this.deliveryFee(),
      total: this.total(),
    };

    console.log('ORDER REQUEST', request);

    // Plus tard :
    // this.orderService.createOrder(request).subscribe(order => {
    //   this.cartService.clear();
    //   this.router.navigate(['/orders', order.id, 'confirmation']);
    // });
  }

  goBackToMenu(): void {
    this.router.navigate(['/home']);
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  async openCustomerDetailsModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CustomerDetailsModal,
      cssClass: 'checkout-modal',
      componentProps: {
        firstname: this.form.controls.firstname.value,
        lastname: this.form.controls.lastname.value,
        phone: this.form.controls.phone.value,
      },
      backdropDismiss: true,
      enterAnimation: modalEnterAnimation,
      leaveAnimation: modalLeaveAnimation,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<CustomerDetailsModal>();

    if (role === 'save' && data) {
      this.form.patchValue(data);

      this.userService.updateProfile({
        firstname: data.firstname,
        lastname: data.lastname,
        phone: data.phone,
      }).subscribe();
    }
  }

  async openAddressModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: CheckoutAddressModal,
      cssClass: 'checkout-modal',
      backdropDismiss: true,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<UserAddress>();

    if (role === 'empty') {
      this.clearSelectedAddress();
      return;
    }

    if (role === 'select' && data) {
      this.selectedAddress.set(data);

      this.form.patchValue({
        address: this.formatAddress(data),
      });

      this.validateDeliveryAddress(data);
    }
  }

  private clearSelectedAddress(): void {
    this.selectedAddress.set(null);
    this.deliveryValidation.set(null);
    this.deliveryFeeValue.set(0);

    this.form.patchValue({
      address: '',
    });
  }

  private validateDeliveryAddress(address: UserAddress): void {
    console.log('VALIDATE ADDRESS', address);

    if (address.latitude == null || address.longitude == null) {
      console.log('MISSING COORDINATES');

      this.deliveryValidation.set({
        deliverable: false,
        deliveryFee: 0,
        minOrderAmount: 0,
        reason: 'Adresse incomplète : coordonnées manquantes.',
      });

      this.deliveryFeeValue.set(0);
      return;
    }

    this.restaurantDeliveryService.validateAddress(
      this.restaurantId,
      address.latitude,
      address.longitude,
    ).subscribe({
      next: (validation) => {
        console.log('DELIVERY VALIDATION RESULT', validation);

        this.deliveryValidation.set(validation);
        this.deliveryFeeValue.set(validation.deliverable ? validation.deliveryFee : 0);
      },
      error: (error) => {
        console.error('DELIVERY VALIDATION ERROR', error);

        this.deliveryValidation.set({
          deliverable: false,
          deliveryFee: 0,
          minOrderAmount: 0,
          reason: 'Impossible de vérifier l’adresse de livraison.',
        });

        this.deliveryFeeValue.set(0);
      },
    });
  }

  private formatAddress(address: UserAddress): string {
    return [
      address.street,
      address.streetNumber,
      address.postalCode,
      address.city,
    ]
      .filter(Boolean)
      .join(' ');
  }

  async openDeliveryTimeModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DeliveryTimeModal,
      cssClass: 'checkout-modal',
      backdropDismiss: true,
      componentProps: {
        orderType: this.form.controls.orderType.value,
        selectedType: this.form.controls.deliveryTime.value,
        initialDate: this.scheduledDate(),
        initialTime: this.scheduledTime(),
      },
      enterAnimation: modalEnterAnimation,
      leaveAnimation: modalLeaveAnimation,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<DeliveryTimeResult>();

    if (role === 'save' && data) {
      this.form.patchValue({
        deliveryTime: data.type,
      });

      this.deliveryTimeLabel.set(data.label);
      this.scheduledDate.set(data.date ?? null);
      this.scheduledTime.set(data.time ?? null);
    }
  }

  async openOrderNoteModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: OrderNoteModal,
      cssClass: 'checkout-modal',
      componentProps: {
        note: this.form.controls.note.value,
      },
      backdropDismiss: true,
      enterAnimation: modalEnterAnimation,
      leaveAnimation: modalLeaveAnimation,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<OrderNoteModalResult>();

    if (role === 'save' && data) {
      this.form.patchValue({
        note: data.note,
      });
    }
  }
}
