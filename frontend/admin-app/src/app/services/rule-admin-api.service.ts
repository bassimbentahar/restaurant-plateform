import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';
import {
  RestaurantRuleCreateRequest,
  RestaurantRuleResponse,
  RestaurantRuleUpdateRequest
} from '../pages/rule/dto/rule-admin.dto';



@Injectable({
  providedIn: 'root',
})
export class RuleAdminApiService {
  private readonly http = inject(HttpClient);

  private readonly restaurantId =
    '01000000-0000-0000-0000-000000000001';

  private readonly baseUrl =
    `${environment.apiUrl}/api/v1/restaurants/${this.restaurantId}`;

  getRules(): Observable<RestaurantRuleResponse[]> {
    return this.http.get<RestaurantRuleResponse[]>(
      `${this.baseUrl}/rules`
    );
  }

  getRuleLibrary(): Observable<RestaurantRuleResponse[]> {
    return this.http.get<RestaurantRuleResponse[]>(
      `${this.baseUrl}/rules/library`
    );
  }

  getFavoriteRules(): Observable<RestaurantRuleResponse[]> {
    return this.http.get<RestaurantRuleResponse[]>(
      `${this.baseUrl}/rules/favorites`
    );
  }

  createRule(
    request: RestaurantRuleCreateRequest
  ): Observable<RestaurantRuleResponse> {
    return this.http.post<RestaurantRuleResponse>(
      `${this.baseUrl}/rules`,
      request
    );
  }

  updateRule(
    ruleId: string,
    request: RestaurantRuleUpdateRequest
  ): Observable<RestaurantRuleResponse> {
    return this.http.put<RestaurantRuleResponse>(
      `${this.baseUrl}/rules/${ruleId}`,
      request
    );
  }

  toggleFavorite(ruleId: string): Observable<RestaurantRuleResponse> {
    return this.http.patch<RestaurantRuleResponse>(
      `${this.baseUrl}/rules/${ruleId}/favorite`,
      {}
    );
  }

  deleteRule(ruleId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/rules/${ruleId}`
    );
  }
}
