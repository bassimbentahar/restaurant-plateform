import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ProductCreatedResponse,
  ProductCreateRequest,
} from '../models/product-create-request.model';
import {Product} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/products`;

  constructor(private readonly http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductsByCategory(categoryId: string): Observable<Product[]> {
    const params = new HttpParams().set('categoryId', categoryId);
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(request: ProductCreateRequest): Observable<ProductCreatedResponse> {
    return this.http.post<ProductCreatedResponse>(this.apiUrl, request);
  }


}
