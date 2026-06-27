import {ProductRuleType} from '../../product-wizard/state/product-editor.model';
import {ProductRuleActionRequest, ProductRuleConditionRequest} from '../../product-wizard/data-access/product-admin.dto';


export type RuleLibraryFilter =
  | 'all'
  | 'favorites'
  | 'promotions'
  | 'menus'
  | 'delivery'
  | 'students';

export interface RuleTagResponse {
  id: string;
  name: string;
  color?: string;
}

export interface RestaurantRuleResponse {
  id: string;
  name: string;
  description?: string;
  type: ProductRuleType;

  active: boolean;
  favorite: boolean;
  reusable: boolean;

  customerVisible: boolean;
  customerTitle?: string;
  customerDescription?: string;

  condition: ProductRuleConditionRequest;
  action: ProductRuleActionRequest;

  tags: RuleTagResponse[];
}

export interface RestaurantRuleCreateRequest {
  name: string;
  description?: string;
  type: ProductRuleType;

  active: boolean;
  favorite: boolean;
  reusable: boolean;

  customerVisible: boolean;
  customerTitle?: string;
  customerDescription?: string;

  condition: ProductRuleConditionRequest;
  action: ProductRuleActionRequest;

  tags: string[];
}

export interface RestaurantRuleUpdateRequest {
  name?: string;
  description?: string;
  type?: ProductRuleType;

  active?: boolean;
  favorite?: boolean;
  reusable?: boolean;

  customerVisible?: boolean;
  customerTitle?: string;
  customerDescription?: string;

  condition?: ProductRuleConditionRequest;
  action?: ProductRuleActionRequest;

  tags?: string[];
}
