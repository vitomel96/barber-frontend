import { Component } from '@angular/core';
import { AuthUseCase } from '../../../domain/models/Auth/usecase/authusecase';
import { Router } from '@angular/router';
import { GenericFormModule } from '../../../infraestructure/helpers/generic-form-module/generic-form.module';
import { A11yModule } from "@angular/cdk/a11y";
import { GenericSwalService } from '../../utils/genericeswal';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [GenericFormModule, A11yModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class AuthComponent {
  public username: string = '';
  public password: string = '';
  showPassword: boolean = false;

  loginError: string | null = null;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  constructor(private authUseCase: AuthUseCase, private genericSwalService: GenericSwalService, private router: Router) {}

  ngOnInit(): void {
    const authTokenExpiration = localStorage.getItem('authTokenExpiration');

    if (authTokenExpiration) {
      const expirationDate = new Date(authTokenExpiration);
      const currentDate = new Date();

      if (expirationDate < currentDate) {
        this.authUseCase.clearToken();
        localStorage.removeItem('user');
        this.router.navigate(['/internal/inicio']);
      }
    }
  }

async onLogin() {
  this.authUseCase.login(this.username, this.password).subscribe({
    next: (response: any) => {
      console.log('navegando')
      this.router.navigate(['/internal/inicio']);
    },
    error: (err) => {
      console.error('Login failed', err);

      // Error HTTP válido
      if (err.status === 401 || err.status === 400) {
        const message = err?.error?.message;

        if (message === 'Client credentials not found or inactive') {
          this.loginError = 'Las credenciales para este usuario se encuentran vencidas';
        } else {
          this.loginError = 'Usuario o contraseña incorrecto.';
        }
        return;
      }

      // Error de conexión / servidor caído
      if (err.status === 0) {
        this.loginError =
          'No se puede establecer conexión con el servidor de autenticación. Intente nuevamente más tarde.';
        this.genericSwalService.genericSwalFire(
          this.loginError,
          false,
          false,
          true,
          'error'
        );
        return;
      }

      // Fallback
      this.loginError = 'Error inesperado. Intente nuevamente.';
    },
  });
}

}
