export interface SelectedVariant {
  variantId: string;
  variantName: string;
  basePrice: number;
}

export interface SelectedOption {
  optionGroupId: string;
  optionGroupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // id unique de ligne panier
  productId: string;
  productName: string;
  productImage?: string;

  quantity: number;

  selectedVariant?: SelectedVariant | null;
  selectedOptions: SelectedOption[];

  baseUnitPrice: number;
  unitFinalPrice: number;
  lineTotalPrice: number;

  specialInstructions?: string;
}
