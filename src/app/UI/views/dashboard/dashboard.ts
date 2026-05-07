import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy
} from '@angular/core';

import { MatCardModule } from '@angular/material/card';

import {
  Subject,
  forkJoin,
  interval,
  startWith,
  switchMap,
  takeUntil
} from 'rxjs';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexPlotOptions,
  ApexYAxis,
  ApexTooltip,
  ChartComponent,
  NgApexchartsModule
} from 'ng-apexcharts';

import { AppointmentUseCase } from '../../../domain/models/Appointment/usecase/appointmentusecase';
import { ClientUseCase } from '../../../domain/models/Client/usecase/clientusecase';

import { Appointment } from '../../../domain/models/Appointment/Appointment';
import { AppointmentStatus } from '../../../domain/models/Appointment/AppointmentStatus';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TimeFormatPipe } from '../../pipes/time-format.pipe';

export type ChartOptions = {
  series: any;
  chart: any;
  xaxis: any;
  yaxis: any;
  dataLabels: any;
  stroke: any;
  plotOptions: any;
  tooltip: any;
  colors?: any;
};

@Component({
  selector: 'app-dashboard',
  imports: [
    NgIf,
    NgApexchartsModule,
    NgFor,
    MatCardModule,
    MatIconModule,
    TimeFormatPipe
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Dashboard implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  pendingAppointments = 0;
  clients = 0;
  incomeToday = 0;
  ocupation = 0;
  freeSlots = 0;

  nextAppointments: any[] = [];
  topBarbers: any[] = [];

  // Charts
  weeklyIncomeChart!: Partial<ChartOptions>;
  servicesChart!: Partial<ChartOptions>;

  constructor(
    private appointmentUseCase: AppointmentUseCase,
    private clientUseCase: ClientUseCase
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {

    interval(30000)
      .pipe(
        startWith(0),

        switchMap(() =>
          forkJoin({
            appointments: this.appointmentUseCase.getAllAppointments(),
            clients: this.clientUseCase.getAllClients()
          })
        ),

        takeUntil(this.destroy$)
      )
      .subscribe({

        next: ({ appointments, clients }: any) => {

          this.clients = clients?.length || 0;

          const today = this.formatDate(new Date());

          const todayPending = appointments.filter((a: Appointment) =>
            a.date === today &&
            a.status === AppointmentStatus.PENDING
          );

          const completedToday = appointments.filter((a: Appointment) =>
            a.date === today &&
            a.status === AppointmentStatus.COMPLETED
          );

          this.pendingAppointments = todayPending.length;

          this.incomeToday = completedToday.reduce(
            (sum: number, item: any) =>
              sum + Number(item.price || 0),
            0
          );

          const occupiedMinutes = todayPending.reduce(
            (sum: number, item: any) =>
              sum + Number(item.duration || 0),
            0
          );

          const totalAvailableMinutes = 1800;

          this.ocupation =
            totalAvailableMinutes > 0
              ? Math.round(
                  (occupiedMinutes / totalAvailableMinutes) * 100
                )
              : 0;

          this.freeSlots =
            Math.max(
              0,
              Math.floor(
                (totalAvailableMinutes - occupiedMinutes) / 30
              )
            );

          this.nextAppointments = todayPending
            .sort((a: any, b: any) =>
              a.hour.localeCompare(b.hour)
            )
            .slice(0, 5)
            .map((a: any) => ({
              name:
                `${a.client?.name || ''} ${a.client?.last_name || ''}`.trim(),
              service: a.service?.name || '',
              hour: a.hour,
              barber:
                `${a.barber?.name || ''} ${a.barber?.last_name || ''}`.trim()
            }));

          this.buildWeeklyIncomeChart(appointments);
          this.buildServicesChart(appointments);

        },

        error: (error) => {
          console.error(error);
        }

      });
  }

  // =========================
  // CHART 1 INGRESOS SEMANA
  // =========================
buildWeeklyIncomeChart(appointments: any[]): void {

  const labels = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const values = [0,0,0,0,0,0,0];

  const now = new Date();
  const monday = new Date(now);

  monday.setDate(
    now.getDate() - ((now.getDay() + 6) % 7)
  );

  monday.setHours(0,0,0,0);

  appointments.forEach((a:any) => {

    if (a.status !== 'COMPLETED') return;

    const d = new Date(a.date);
    d.setHours(0,0,0,0);

    const diff = Math.floor(
      (d.getTime() - monday.getTime()) / 86400000
    );

    if (diff >= 0 && diff < 7) {
      values[diff] += Number(a.price || 0);
    }

  });

  this.weeklyIncomeChart = {

    series: [
      {
        name: 'Ingresos',
        data: values
      }
    ],

    chart: {
      type: 'line',
      height: 320,

      toolbar: {
        show: false
      },

      zoom: {
        enabled: false
      },

      animations: {
        enabled: true,
        speed: 500
      },

      sparkline: {
        enabled: false
      }
    },

    stroke: {
      curve: 'smooth',
      width: 4
    },

    dataLabels: {
      enabled: false
    },

    xaxis: {
      categories: labels,
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },

    yaxis: {
      labels: {
        formatter: (val:any) => '$' + val
      }
    },

    tooltip: {
      y: {
        formatter: (val:any) => '$' + val
      }
    },

    colors: ['#f59e0b']
  };
}


/* =========================
   CHART 2 SERVICIOS TOP
========================= */

buildServicesChart(appointments: any[]): void {

  const map: any = {};
  const month = this.formatDate(new Date()).slice(0,7);

  appointments.forEach((a:any) => {

    if (!a.date?.startsWith(month)) return;

    const name = a.service?.name || 'Otro';

    if (!map[name]) {
      map[name] = 0;
    }

    map[name]++;

  });

  const sorted =
    Object.entries(map)
      .sort((a:any,b:any) => b[1]-a[1])
      .slice(0,5);

  this.servicesChart = {

    series: [
      {
        name: 'Citas',
        data: sorted.map((x:any) => x[1])
      }
    ],

    chart: {
      type: 'bar',
      height: 320,

      toolbar: {
        show: false
      },

      zoom: {
        enabled: false
      },

      animations: {
        enabled: true,
        speed: 500
      }
    },

    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '55%',
        distributed: false
      }
    },

    dataLabels: {
      enabled: false
    },

    xaxis: {
      categories: sorted.map((x:any) => x[0]),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },

    yaxis: {},

    tooltip: {},

    colors: ['#8b5cf6']
  };
}

  formatDate(date: Date): string {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2,'0');
    const day = String(date.getDate()).padStart(2,'0');

    return `${year}-${month}-${day}`;
  }
}
