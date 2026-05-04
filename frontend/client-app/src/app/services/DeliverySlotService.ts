import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DeliverySlot {
  time: string;
  label: string;
  disabled: boolean;
  reason?: string;
}

export interface DeliverySlotDay {
  date: string;
  label: string;
  disabled: boolean;
  slots: DeliverySlot[];
}

@Injectable({ providedIn: 'root' })
export class DeliverySlotService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/restaurants/01000000-0000-0000-0000-000000000001/delivery-slots`;

  constructor(private http: HttpClient) {}

  getSlots(type: 'DELIVERY' | 'PICKUP') {
    const params = new HttpParams().set('type', type);

    return this.http.get<DeliverySlotDay[]>(this.apiUrl, { params });
  }
}
