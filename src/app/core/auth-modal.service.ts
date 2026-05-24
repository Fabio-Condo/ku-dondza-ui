import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {

  visible$ = new BehaviorSubject<boolean>(false);

  open() {
    this.visible$.next(true);
  }

  close() {
    this.visible$.next(false);
  }

}