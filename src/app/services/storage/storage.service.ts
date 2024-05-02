import { Injectable } from '@angular/core';
import { SessionStorage, LocalStorage } from 'ngx-store';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  @LocalStorage({ key: 'CygenAuthentications347' }) userDetails: object = {};

  constructor() { }

  saveUserDetails(data: any) {
    this.userDetails = data;
  }

  removeUserDetails() {
    this.userDetails = {};
  }
}
