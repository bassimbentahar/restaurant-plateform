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
}
