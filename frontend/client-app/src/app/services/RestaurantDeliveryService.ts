
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {DeliveryValidationResponse} from "../models/user-address.model";

@Injectable({
  providedIn: 'root',
})
export class RestaurantDeliveryService {

  private readonly apiUrl = `${environment.apiUrl}/api/v1/restaurants`;

  constructor(private http: HttpClient) {}

  validateAddress(restaurantId: string, lat: number, lng: number) {
    const params = new HttpParams()
      .set('lat', lat)
      .set('lng', lng);

    return this.http.get<DeliveryValidationResponse>(
      `${this.apiUrl}/${restaurantId}/delivery-zones/validate`,
      { params }
    );
  }
}
