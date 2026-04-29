import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import {Auth} from "shared";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    RouterLink
  ]
})
export class AuthPage {

  constructor(private authService: Auth) {}

  async login(): Promise<void> {
    await this.authService.login();
  }

  async register(): Promise<void> {
    await this.authService.register();
  }
}
