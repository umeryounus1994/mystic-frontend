import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { HelperService } from '../../services/helper/helper.service';

/**
 * Guard that allows access only if the user is admin or has the required permission
 * (or "All") in route data. Use with AuthGuard: canActivate: [AuthGuard, PermissionGuard].
 * Route data: { permission: 'Quest' } (must match sidebar permission values).
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private helper: HelperService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Full access for admin
    if (this.auth.isAdmin) {
      return true;
    }
    // Partner and family use role-based access (sidebar), not subadmin permissions
    if (this.auth.isPartner || this.auth.isFamily) {
      return true;
    }

    const permission = route.data?.['permission'] as string | undefined;
    // No permission required for this route
    if (!permission) {
      return true;
    }

    const perms = this.auth.user?.permissions || [];
    if (perms.includes('All') || perms.includes(permission)) {
      return true;
    }

    this.helper.warningToast('You do not have permission to access this page.');
    this.router.navigate(['/dashboard/admin']);
    return false;
  }
}
