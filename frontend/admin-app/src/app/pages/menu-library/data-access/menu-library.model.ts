import { OptionGroupLibraryItem } from '../../product-wizard/state/product-editor.model';
import { RestaurantRuleResponse } from '../../rule/dto/rule-admin.dto';

export type MenuLibraryTabId =
  | 'choices'
  | 'offers'
  | 'availability';

export type MenuLibraryCardKind =
  | 'choice'
  | 'offer'
  | 'availability';

export type MenuLibraryRuleType =
  | 'AVAILABILITY'
  | 'VISIBILITY'
  | 'SELECTION_RULE'
  | 'INCLUDED_OPTION'
  | 'PRICE_RULE';

export interface MenuLibraryTab {
  id: MenuLibraryTabId;
  labelKey: string;
  helpKey: string;
  icon: string;
}

export interface MenuLibraryCardMetadata {
  labelKey: string;
  value: string | number;
}

export interface MenuLibraryCard {
  id: string;
  kind: MenuLibraryCardKind;
  title: string;
  description?: string;
  badgeKey: string;
  metadata: MenuLibraryCardMetadata[];
  tags: string[];
  disabled?: boolean;
}

export type ChoiceEditorMode = 'create' | 'edit' | 'duplicate';

export interface ChoiceEditorOptionDraft {
  id: string;
  optionItemId?: string;
  name: string;
  priceDelta: number | null;
  isAvailable: boolean;
  displayOrder: number;
}

export interface ChoiceEditorResult {
  id?: string;
  name: string;
  description?: string;
  required: boolean;
  minSelections: number;
  maxSelections: number;
  items: ChoiceEditorOptionDraft[];
}

export type OfferEditorType =
  | 'PRICE_RULE'
  | 'INCLUDED_OPTION'
  | 'SELECTION_RULE';

export interface OfferEditorResult {
  id?: string;
  name: string;
  description?: string;
  type: OfferEditorType;
  active: boolean;
  favorite: boolean;
  customerVisible: boolean;
  customerTitle?: string;
  customerDescription?: string;
  tags: string[];
  timeFrom?: string;
  timeTo?: string;
  priceDeltaOverride?: number;
  includedSelections?: number;
  minSelections?: number;
  maxSelections?: number;
}

export type AvailabilityEditorType =
  | 'AVAILABILITY'
  | 'VISIBILITY';

export interface AvailabilityEditorResult {
  id?: string;
  name: string;
  description?: string;
  type: AvailabilityEditorType;
  active: boolean;
  favorite: boolean;
  customerVisible: boolean;
  customerTitle?: string;
  customerDescription?: string;
  tags: string[];
  daysOfWeek: string[];
  timeFrom?: string;
  timeTo?: string;
  orderType?: string;
  available?: boolean;
  visible?: boolean;
}

export interface MenuLibraryResolvedCard {
  card: MenuLibraryCard;
  choice?: OptionGroupLibraryItem;
  rule?: RestaurantRuleResponse;
}
