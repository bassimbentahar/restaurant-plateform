import {Component, AfterViewInit, OnInit, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonTitle,
  IonToolbar,
  IonToggle,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import {UserAddressRequest} from '../../models/user-address.model';
import {environment} from '../../../environments/environment';
import {AddressService} from '../../services/AddressService';

declare const google: any;

@Component({
  selector: 'app-address-modal',
  standalone: true,
  templateUrl: './address-modal.html',
  styleUrls: ['./address-modal.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonToggle
  ]
})
export class AddressModal implements OnInit, AfterViewInit {

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private addressService = inject(AddressService);
  private toastCtrl = inject(ToastController);
  shakeLabel = false;
  labelExists = false;
  protected addressExists = false;
  addressForm = this.fb.nonNullable.group({
    label: ['', [Validators.required, Validators.minLength(2)]],
    street: [''],
    streetNumber: [''],
    postalCode: [''],
    city: [''],
    country: ['Switzerland'],
    instructions: [''],
    defaultAddress: [false]
  });

  ngOnInit(): void {
    this.addressForm.get('label')?.valueChanges.subscribe(value => {
      this.checkLabelExists(value);
    });

    this.addressForm.valueChanges.subscribe(() => {
      this.checkAddressExists();
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loadGoogleMapsScript();

    setTimeout(() => {
      this.initAutocomplete();
    }, 300);
  }

  private checkLabelExists(value: string): void {
    const label = value.trim().toLowerCase();

    if (!label) {
      this.labelExists = false;
      return;
    }

    this.labelExists = this.addressService.currentAddresses.some(address =>
      address.label.trim().toLowerCase() === label
    );

    if (this.labelExists) {
      this.triggerShake();
    }
  }

  private loadGoogleMapsScript(): Promise<void> {
    if ((window as any).google?.maps?.places) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const scriptId = 'google-maps-script';

      if (document.getElementById(scriptId)) {
        const interval = setInterval(() => {
          if ((window as any).google?.maps?.places) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve();
      script.onerror = () => reject('Google Maps script loading failed');

      document.head.appendChild(script);
    });
  }

  private initAutocomplete(): void {
    const input = document.getElementById('address-autocomplete-input') as HTMLInputElement;

    if (!input || !(window as any).google?.maps?.places) {
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(input, {
      types: ['address'],
      componentRestrictions: {country: 'ch'}
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.address_components) {
        return;
      }

      this.fillAddressForm(place.address_components);
    });
  }

  private fillAddressForm(components: any[]): void {
    const get = (type: string) =>
      components.find(component => component.types.includes(type))?.long_name ?? '';

    const street = get('route');
    const streetNumber = get('street_number');
    const postalCode = get('postal_code');

    const city =
      get('locality') ||
      get('postal_town') ||
      get('administrative_area_level_2');

    const country = get('country') || 'Switzerland';

    this.addressForm.patchValue({
      street,
      streetNumber,
      postalCode,
      city,
      country
    });
  }

  cancel(): void {
    this.modalCtrl.dismiss();
  }

  async save(): Promise<void> {
    const request: UserAddressRequest = this.addressForm.getRawValue();

    this.checkLabelExists(request.label);

    if (this.labelExists) {
      this.triggerShake();
      await this.showDuplicateToast();
      return;
    }

    if (this.addressExists) {
      await this.showDuplicateAddressToast();
      return;
    }

    this.modalCtrl.dismiss(request);
  }

  private checkAddressExists(): void {
    const form = this.addressForm.getRawValue();

    const street = form.street?.trim().toLowerCase();
    const number = form.streetNumber?.trim().toLowerCase();
    const postalCode = form.postalCode?.trim();
    const city = form.city?.trim().toLowerCase();

    if (!street || !postalCode || !city) {
      this.addressExists = false;
      return;
    }

    this.addressExists = this.addressService.currentAddresses.some(a =>
      a.street.toLowerCase() === street &&
      (a.streetNumber ?? '').toLowerCase() === number &&
      a.postalCode === postalCode &&
      a.city.toLowerCase() === city
    );
  }

  private triggerShake(): void {
    this.shakeLabel = false;

    setTimeout(() => {
      this.shakeLabel = true;
    }, 0);

    setTimeout(() => {
      this.shakeLabel = false;
    }, 350);
  }

  private async showDuplicateToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Ce nom d’adresse existe déjà.',
      duration: 2500,
      position: 'top',
      color: 'danger'
    });

    await toast.present();
  }

  private async showDuplicateAddressToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Cette adresse existe déjà.',
      duration: 2500,
      position: 'top',
      color: 'warning'
    });

    await toast.present();
  }
}
