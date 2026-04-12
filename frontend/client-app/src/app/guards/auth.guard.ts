import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import {Auth} from "shared";

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);

  if (auth.isLoggedIn()) {
    return true;
  }

  await auth.login();
  return false;
};
