import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as CryptoJS from 'crypto-js';
import { EncryptionPassword } from '../../constants/constants';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private toastrService: ToastrService) { }

  // Toasts:
  successToast(message: any) {
    this.toastrService.success(message);
  }
  infoToast(message: any) {
    this.toastrService.info(message);
  }
  warningToast(message: any) {
    this.toastrService.warning(message);
  }
  failureToast(message: any) {
    this.toastrService.error(message);
  }


  // DateTime:
  getCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return (yyyy + '/' + mm + '/' + dd);
  }
  getCurrentDateForm() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return (yyyy + '-' + mm + '-' + dd);
  }
  getCurrentTime() {
    const today = new Date();
    const hh = String(today.getHours()).padStart(2, '0');
    const mm = String(today.getMinutes()).padStart(2, '0');
    const ss = String(today.getSeconds()).padStart(2, '0');

    return (hh + ':' + mm + ':' + ss);
  }
  getReportFormatedDate(date: any) {
    const today = new Date(date);
    const dd = String(today.getDate());
    const mm = String(today.getMonth() + 1);
    const yyyy = today.getFullYear();

    return (mm + '/' + dd + '/' + yyyy);
  }
  getReportFormatedDateYMD(date: any) {
    const today = new Date(date);
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return (yyyy + '-' + mm + '-' + dd);
  }

  // Encryption:
  encryptData(data: any) {
    return CryptoJS.AES.encrypt(data.toString(), EncryptionPassword).toString();
  }
  decryptData(data: any) {
    return CryptoJS.AES.decrypt(data, EncryptionPassword).toString(CryptoJS.enc.Utf8);
  }
}
