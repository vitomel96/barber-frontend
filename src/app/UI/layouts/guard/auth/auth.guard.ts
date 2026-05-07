import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AuthService } from '../../../../infraestructure/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private overlayContainer: OverlayContainer
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.dialog.closeAll();

      const overlays = this.overlayContainer.getContainerElement();
      overlays.innerHTML = '';

      this.router.navigate(['/auth']);
      return false;
    }
  }
}
