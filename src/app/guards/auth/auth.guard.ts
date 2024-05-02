import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) { }


  canActivate() {
    //console.clear();
    if (this.auth.isLoggedIn) {
      return true;
    }
    this.router.navigate(['/auth/login']);
    return false;
  }
}
