import { Routes } from "@angular/router";
import { Dashboard } from "./UI/views/dashboard/dashboard";
import { Clients } from "./UI/views/clients/clients";
import { AppointmentList } from "./UI/views/appointments/appointment-list/appointment-list";
import { Barbers } from "./UI/views/barbers/barbers";
import { AppointmentsCalendarComponent } from "./UI/views/appointments/appointments-calendar/appointments-calendar";
import { ServicesListComponent } from "./UI/views/services/services-list/services-list";
import { RewardAdmin } from "./UI/views/rewards/reward-admin/reward-admin";
import { FinanceRecordsComponent } from "./UI/views/finance/finance-records/finance-records";
import { FinanceType } from "./domain/models/Finance/FinanceType";
import { FinanceTipsControlComponent } from "./UI/views/finance/finance-tips-control/finance-tips-control";
import { FinanceReportComponent } from "./UI/views/finance/finance-report/finance-report";

export const ALL_INTERNAL_ROUTES: Routes = [
  {
    path: 'inicio',
    component: Dashboard
  },
  {
    path: 'citas',
    children: [
      {
        path: '',
        component: AppointmentList
      },
      {
        path: 'calendario',
        component: AppointmentsCalendarComponent
      },
      {
        path: 'historial',
        loadComponent: () => import('./UI/views/appointments/appointment-history/appointment-history').then(m => m.AppointmentHistory)
      }
    ]
  },
  {
    path: 'clientes',
    component: Clients
  },
  {
    path: 'barberos',
    component: Barbers
  },
  { path: 'servicios', component: ServicesListComponent },
  { path: 'premios', component: RewardAdmin },
  {
    path: 'finanzas',
    children: [
      {
        path: 'ingresos',
        component: FinanceRecordsComponent,
        data: { title: 'Ingresos', financeType: FinanceType.INCOME }
      },
      {
        path: 'egresos',
        component: FinanceRecordsComponent,
        data: { title: 'Egresos', financeType: FinanceType.EXPENSE }
      },
      {
        path: 'egresos-fijos',
        component: FinanceRecordsComponent,
        data: { title: 'Egresos Fijos Barbería', financeType: FinanceType.FIXED_EXPENSE }
      },
      {
        path: 'propinas',
        component: FinanceTipsControlComponent
      },
      {
        path: 'reportes',
        component: FinanceReportComponent
      },

      {
        path: '',
        redirectTo: 'ingresos',
        pathMatch: 'full'
      }
    ]
  }
];
