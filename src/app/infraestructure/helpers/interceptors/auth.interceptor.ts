import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { LoadingService } from '../../services/loading/loading.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private _loadingService: LoadingService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._loadingService.startLoading();

    if (req.url.includes('/auth')) {
      return next.handle(req).pipe(finalize(() => this._loadingService.stopLoading()));
    }

    const token = this.authService.getToken();
    if (token) {
      const clonedRequest = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next.handle(clonedRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return this.handle401Error(req, next);
          }
          return throwError(() => error);
        }),
        finalize(() => this._loadingService.stopLoading())
      );
    }

    return from(this.authService.fetchToken()).pipe(
      switchMap((newToken) => {
        const clonedRequest = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });
        return next.handle(clonedRequest);
      }),
      catchError((error) => {
        console.error('Error obteniendo token inicial:', error);
        return throwError(() => error);
      }),
      finalize(() => this._loadingService.stopLoading())
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.authService.fetchToken()).pipe(
      switchMap((newToken) => {
        const clonedRequest = req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        });
        return next.handle(clonedRequest);
      }),
      catchError((error) => {
        console.error('Error al refrescar token tras 401:', error);
        return throwError(() => error);
      })
    );
  }
}
