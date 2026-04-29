import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import {User, UserRequest} from "../models/user.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl = `${environment.apiUrl}/api/v1/users`;

  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadMe() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  updateProfile(request: UserRequest) {
    return this.http.put<User>('/api/users/me', request).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  clear(): void {
    this.userSubject.next(null);
  }
}
