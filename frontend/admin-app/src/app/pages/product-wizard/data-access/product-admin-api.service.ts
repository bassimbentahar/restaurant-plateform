import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ProductCreateRequest,
  ProductCreatedResponse,
  ProductResponse,
  ProductCategoryResponse,
  ProductCategoryCreateRequest, ProductSummaryResponse,
} from './product-admin.dto';
import { environment } from '../../../../environments/environment';
import { OptionGroupLibraryItem } from '../state/product-editor.model';

export interface OptionGroupItemAdminRequest {
  id?: string;
  optionItemId?: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface OptionGroupAdminRequest {
  name: string;
  description?: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  items: OptionGroupItemAdminRequest[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductAdminApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${environment.apiUrl}/api/v1/products`;
  private readonly restaurantId = '01000000-0000-0000-0000-000000000001';

  getProducts(): Observable<ProductSummaryResponse[]> {
    return this.http.get<ProductSummaryResponse[]>(this.baseUrl);
  }

  createProduct(
    request: ProductCreateRequest
  ): Observable<ProductCreatedResponse> {
    return this.http.post<ProductCreatedResponse>(this.baseUrl, request);
  }

  getProduct(productId: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      `${environment.apiUrl}/api/v1/admin/products/${productId}/edit`
    );
  }

  getOptionGroups(): Observable<OptionGroupLibraryItem[]> {
    return this.http.get<OptionGroupLibraryItem[]>(
      `${environment.apiUrl}/api/v1/option-groups`
    );
  }

  createOptionGroup(
    request: OptionGroupAdminRequest
  ): Observable<OptionGroupLibraryItem> {
    return this.http.post<OptionGroupLibraryItem>(
      `${environment.apiUrl}/api/v1/option-groups`,
      request
    );
  }

  updateOptionGroup(
    optionGroupId: string,
    request: OptionGroupAdminRequest
  ): Observable<OptionGroupLibraryItem> {
    return this.http.put<OptionGroupLibraryItem>(
      `${environment.apiUrl}/api/v1/option-groups/${optionGroupId}`,
      request
    );
  }

  getCategories(): Observable<ProductCategoryResponse[]> {
    return this.http.get<ProductCategoryResponse[]>(
      `${environment.apiUrl}/api/v1/restaurants/${this.restaurantId}/categories`
    );
  }

  createCategory(
    request: ProductCategoryCreateRequest
  ): Observable<ProductCategoryResponse> {
    return this.http.post<ProductCategoryResponse>(
      `${environment.apiUrl}/api/v1/restaurants/${this.restaurantId}/categories`,
      request
    );
  }
}
