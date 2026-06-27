export interface UserAddress {
  id: string;
  label: string;
  street: string;
  streetNumber?: string;
  postalCode: string;
  city: string;
  country: string;
  instructions?: string;
  defaultAddress: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface UserAddressRequest {
  label: string;
  street: string;
  streetNumber?: string;
  postalCode: string;
  city: string;
  country?: string;
  instructions?: string;
  defaultAddress: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export interface DeliveryValidationResponse {
  deliverable: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  zoneName?: string;
  reason?: string;
}
