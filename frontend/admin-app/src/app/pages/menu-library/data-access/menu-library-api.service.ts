import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  OptionGroupAdminRequest,
  ProductAdminApiService,
} from '../../product-wizard/data-access/product-admin-api.service';
import { OptionGroupLibraryItem } from '../../product-wizard/state/product-editor.model';
import { RuleAdminApiService } from '../../../services/rule-admin-api.service';
import {
  RestaurantRuleCreateRequest,
  RestaurantRuleResponse,
  RestaurantRuleUpdateRequest,
} from '../../rule/dto/rule-admin.dto';

@Injectable({
  providedIn: 'root',
})
export class MenuLibraryApiService {
  private readonly productAdminApi = inject(ProductAdminApiService);
  private readonly ruleAdminApi = inject(RuleAdminApiService);

  getChoices(): Observable<OptionGroupLibraryItem[]> {
    return this.productAdminApi.getOptionGroups();
  }

  createChoice(
    request: OptionGroupAdminRequest
  ): Observable<OptionGroupLibraryItem> {
    return this.productAdminApi.createOptionGroup(request);
  }

  updateChoice(
    choiceId: string,
    request: OptionGroupAdminRequest
  ): Observable<OptionGroupLibraryItem> {
    return this.productAdminApi.updateOptionGroup(choiceId, request);
  }

  getRules(): Observable<RestaurantRuleResponse[]> {
    return this.ruleAdminApi.getRuleLibrary();
  }

  createRule(
    request: RestaurantRuleCreateRequest
  ): Observable<RestaurantRuleResponse> {
    return this.ruleAdminApi.createRule(request);
  }

  updateRule(
    ruleId: string,
    request: RestaurantRuleUpdateRequest
  ): Observable<RestaurantRuleResponse> {
    return this.ruleAdminApi.updateRule(ruleId, request);
  }
}
