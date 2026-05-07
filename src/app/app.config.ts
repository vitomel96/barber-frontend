import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AuthInterceptor } from './infraestructure/helpers/interceptors/auth.interceptor';
import { AuthGateway } from './domain/models/Auth/gateway/auth-gateway';
import { AuthService } from './infraestructure/services/auth/auth.service';
import { UserGateway } from './domain/models/User/gateway/user-gateway';
import { UserService } from './infraestructure/services/user/user.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppointmentGateway } from './domain/models/Appointment/gateway/appointment-gateway';
import { AppointmentService } from './infraestructure/services/appointment/appointment.service';
import { ClientGateway } from './domain/models/Client/gateway/client-gateway';
import { ClientService } from './infraestructure/services/client/client.service';
import { BarberGateway } from './domain/models/Barber/gateway/barber-gateway';
import { BarberService } from './infraestructure/services/barber/barber.service';
import { ServiceGateway } from './domain/models/Service/gateway/service-gateway';
import { ServiceService } from './infraestructure/services/service/service.service';
import { RewardGateway } from './domain/models/Reward/gateway/reward-gateway';
import { RewardService } from './infraestructure/services/reward/reward.service';
import { FinanceGateway } from './domain/models/Finance/gateway/finance-gateway';
import { FinanceService } from './infraestructure/services/finance/finance.service';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';


export const appConfig: ApplicationConfig = {
  providers: [
        provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {provide: AuthGateway, useClass: AuthService},
    {provide: UserGateway, useClass: UserService},
    {provide: AppointmentGateway, useClass: AppointmentService},
    {provide: ClientGateway, useClass: ClientService},
    {provide:BarberGateway, useClass: BarberService},
    {provide: ServiceGateway, useClass: ServiceService},
    {provide: RewardGateway, useClass: RewardService},
    {provide: FinanceGateway, useClass: FinanceService},
        provideAnimationsAsync(),
  ]
};
