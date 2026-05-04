export interface DeliverySlotDay {
  date: string;
  label: string;
  disabled: boolean;
  slots: DeliverySlot[];
}

export interface DeliverySlot {
  time: string;
  label: string;
  disabled: boolean;
  reason?: string;
}
