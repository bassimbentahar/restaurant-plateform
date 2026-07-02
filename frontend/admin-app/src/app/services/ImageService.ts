import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly placeholder = 'assets/img/product-placeholder.png';

  getImageUrl(path?: string | null): string {
    const cleanPath = String(path ?? '').trim();

    if (!cleanPath) {
      return this.placeholder;
    }

    if (
      cleanPath.startsWith('http://') ||
      cleanPath.startsWith('https://') ||
      cleanPath.startsWith('data:') ||
      cleanPath.startsWith('blob:')
    ) {
      return cleanPath;
    }

    const normalizedPath = cleanPath.replace(/^\/+/, '');

    if (normalizedPath.startsWith('assets/')) {
      return normalizedPath;
    }

    const imageBaseUrl = environment.imageBaseUrl.replace(/\/+$/, '');

    return `${imageBaseUrl}/${normalizedPath}`;
  }
}
