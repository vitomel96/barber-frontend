import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ViewGuard implements CanActivate {

  constructor(
    private router: Router,
  ) {}
async canActivate(
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean | UrlTree> {

  console.group('🛡️ ViewGuard');
  console.log('➡️ Ruta:', state.url);
  console.log('📄 Route data:', route.data);

  const stored = localStorage.getItem('user');
  if (!stored) {
    console.warn('❌ No hay usuario en localStorage');
    this.router.navigate(['/login']);
    console.groupEnd();
    return false;
  }

  const user = JSON.parse(stored).user;
  if (!user) {
    console.warn('❌ User inválido en localStorage');
    this.router.navigate(['/login']);
    console.groupEnd();
    return false;
  }

  console.log('👤 Usuario:', user.email);
  console.log('👤 Roles:', user.roles?.map((r: any) => r.name));

  // 🔓 ADMIN
  const isAdmin = user.roles?.some(
    (role: { name: string }) => role.name === 'Administrador'
  );
  console.log('🔓 ¿Es admin?:', isAdmin);

  if (isAdmin) {
    console.log('✅ Acceso permitido: Admin');
    console.groupEnd();
    return true;
  }

  // 🔐 VISTAS DEL USUARIO (POR NOMBRE)
  const userViewNames = new Set<string>(
    user.roles
      ?.flatMap((role: any) => role.views ?? [])
      .map((view: any) => view.name) ?? []
  );

  console.log('👁️ Vistas del usuario:', Array.from(userViewNames));

  const requiredView = route.data?.['requiredView'];
  const requiredViews = route.data?.['requiredViews'];

  console.log('🔐 requiredView:', requiredView);
  console.log('🔐 requiredViews:', requiredViews);


  console.log('✅ Acceso permitido');
  console.groupEnd();
  return true;
}


  private async redirectDenied() {
    await Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'No tienes permisos para acceder a esta sección.',
      confirmButtonText: 'Entendido',
    });

    this.router.navigate(['/internal/inicio']);
  }
}
