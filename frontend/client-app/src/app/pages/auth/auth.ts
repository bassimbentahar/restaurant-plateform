import {Component, inject} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);

  constructor(private authService: Auth) {}

  async login(): Promise<void> {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';

    await this.authService.login(returnUrl);
  }

  async register(): Promise<void> {
    await this.authService.register();
  }
}
