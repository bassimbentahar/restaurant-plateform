import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule, FormBuilder} from '@angular/forms';
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonToggle, ModalController
} from '@ionic/angular/standalone';
import {firstValueFrom} from 'rxjs';
import {UserService} from '../../services/user.service';
import {UserRequest} from "../../models/user.model";
import {Auth} from "shared";
import {AddressService} from "../../services/AddressService";
import {AddressModal} from "../address-modal/address-modal";

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonAvatar,
    IonIcon,
    IonToggle
  ]
})
export class Profile implements OnInit {
  activeTab: 'profile' | 'addresses' | 'security' | 'preferences' | 'orders' = 'profile';
  private fb = inject(FormBuilder);
  private auth = inject(Auth)
  private userService = inject(UserService);

  private modalCtrl = inject(ModalController);
  private addressService = inject(AddressService);
  addresses$ = this.addressService.addresses$;

  user$ = this.userService.user$;

  profileForm = this.fb.nonNullable.group({
    firstname: [''],
    lastname: [''],
    dateOfBirth: [''],
    phone: ['']
  });

  async ngOnInit(): Promise<void> {
    const user = this.userService.currentUser
      ?? await firstValueFrom(this.userService.loadMe());

    await firstValueFrom(this.addressService.loadAddresses());

    this.profileForm.patchValue({
      firstname: user.firstname,
      lastname: user.lastname,
      phone: user.phone ?? '',
      dateOfBirth: user.dateOfBirth ?? ''
    });
  }

  async save(): Promise<void> {
    const request: UserRequest = this.profileForm.getRawValue();

    await firstValueFrom(
      this.userService.updateProfile(request)
    );
  }

  async changePassword(): Promise<void> {
    await this.auth.changePassword();
  }

  async addAddress(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AddressModal
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      await firstValueFrom(this.addressService.create(data));
    }
  }

  async deleteAddress(id: string): Promise<void> {
    await firstValueFrom(this.addressService.delete(id));
  }

  async setDefaultAddress(id: string): Promise<void> {
    await firstValueFrom(this.addressService.setDefault(id));
  }
}
