import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { User } from './model/User';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {

  visible$ = new BehaviorSubject<boolean>(false);

  private loginResultSubject?: Subject<User>;

  open(): Observable<User> {

    this.visible$.next(true);

    this.loginResultSubject = new Subject<User>();

    return this.loginResultSubject.asObservable();
  }

  close() {
    this.visible$.next(false);
  }

  notifyLoginSuccess(user: User) {

    if (this.loginResultSubject) {
      this.loginResultSubject.next(user);
      this.loginResultSubject.complete();
    }

    this.close();
  }

  notifyCancelled() {

    if (this.loginResultSubject) {
      this.loginResultSubject.complete();
    }

    this.close();
  }
}