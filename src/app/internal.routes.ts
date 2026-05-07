import { Routes } from '@angular/router';
import { DefaultComponent } from './UI/layouts/default/default.component';
import { ALL_INTERNAL_ROUTES } from './routes.config';
import { AuthGuard } from './UI/guard/auth/auth.guard';
import { InternalComponent } from './UI/layouts/internal/internal.component';

export const INTERNAL_ROUTES: Routes = [
  {
    path: '',
    component: InternalComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      ...ALL_INTERNAL_ROUTES, 
    ],
  },
];
