import {Injectable} from "@angular/core";
import {BehaviorSubject, tap} from "rxjs";
import {UserAddress, UserAddressRequest} from "../models/user-address.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AddressService {

  private readonly apiUrl = `${environment.apiUrl}/api/v1/users/me/addresses`;
  private addressesSubject = new BehaviorSubject<UserAddress[]>([]);
  addresses$ = this.addressesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadAddresses() {
    return this.http.get<UserAddress[]>(this.apiUrl).pipe(
      tap(addresses => this.addressesSubject.next(addresses))
    );
  }

  create(request: UserAddressRequest) {
    return this.http.post<UserAddress>(this.apiUrl, request).pipe(
      tap(() => this.loadAddresses().subscribe())
    );
  }

  update(id: string, request: UserAddressRequest) {
    return this.http.put<UserAddress>(`${this.apiUrl}/${id}`, request).pipe(
      tap(() => this.loadAddresses().subscribe())
    );
  }

  setDefault(id: string) {
    return this.http.patch<UserAddress>(`${this.apiUrl}/${id}/default`, {}).pipe(
      tap(() => this.loadAddresses().subscribe())
    );
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadAddresses().subscribe())
    );
  }

  get currentAddresses(): UserAddress[] {
    return this.addressesSubject.value;
  }
}
