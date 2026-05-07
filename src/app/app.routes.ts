import { Routes } from '@angular/router';
import { DefaultComponent } from './UI/layouts/default/default.component';
import { AuthGuard } from './UI/guard/auth/auth.guard';
import { AuthComponent } from './UI/views/login/login.component';
import { INTERNAL_ROUTES } from './internal.routes';
import { InternalComponent } from './UI/layouts/internal/internal.component';
import { ClientPointsComponent } from './UI/views/client-points/client-points';

export const routes: Routes = [
  {
    path: '',
    component: ClientPointsComponent
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'internal',
    children: INTERNAL_ROUTES,
  }
];
