import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})

export class ImageService {
  getImageUrl(path?: string | null): string {
    if (!path) {
      return 'assets/img/placeholder.png';
    }

    if (path.startsWith('http')) {
      return path;
    }

    return `${environment.apiUrl}${path}`;
  }
}
