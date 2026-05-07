import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import {
  forkJoin,
  interval,
  startWith,
  Subject,
  switchMap,
  takeUntil
} from 'rxjs';

import { Appointment } from '../../../../domain/models/Appointment/Appointment';
import { AppointmentUseCase } from '../../../../domain/models/Appointment/usecase/appointmentusecase';
import { AppointmentStatus } from '../../../../domain/models/Appointment/AppointmentStatus';

import { MatDialog } from '@angular/material/dialog';
import { AppointmentsDialogComponent } from '../appointments-dialog/appointments-dialog';
import { AppointmentDetail } from '../appointment-detail/appointment-detail';
import { AppointmentCloseDialogComponent } from '../appointment-close-dialog/appointment-close-dialog';
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterLink,
    TimeFormatPipe
  ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss',
})
export class AppointmentList implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  dataSource = new MatTableDataSource<Appointment>([]);

  isLoading = false;
  errorMessage = '';

  appointentStatus = AppointmentStatus;

  // BUSCADOR
  searchText: string = '';
  filteredAppointments: Appointment[] = [];

  displayedColumns = [
    'cliente',
    'servicio',
    'barbero',
    'fecha',
    'hora',
    'estado',
    'acciones'
  ];

  pendingClosureAlert = {
    hasAlert: false,
    pendingCount: 0,
    closingTime: '',
    minutesToClose: 0
  };

  constructor(
    private appointmentUseCase: AppointmentUseCase,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() =>
          forkJoin({
            appointments: this.appointmentUseCase.getAllAppointments(),
            alert: this.appointmentUseCase.getPendingClosureAlert()
          })
        ),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ appointments, alert }) => {

          const sorted = this.sortPendingAppointments(appointments);

          this.dataSource.data = sorted;
          this.filteredAppointments = [...sorted];

          this.pendingClosureAlert = alert;
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'No se pudieron cargar las citas';
        }
      });
  }

  filtrarCitas(): void {

    const text = this.searchText.toLowerCase().trim();

    if (!text) {
      this.filteredAppointments = [...this.dataSource.data];
      return;
    }

    this.filteredAppointments = this.dataSource.data.filter((c: any) => {

      const cliente =
        `${c?.client?.name || ''} ${c?.client?.last_name || ''}`.toLowerCase();

      const telefono =
        (c?.client?.phone || '').toLowerCase();

      const barbero =
        `${c?.barber?.name || ''} ${c?.barber?.last_name || ''}`.toLowerCase();

      return (
        cliente.includes(text) ||
        telefono.includes(text) ||
        barbero.includes(text)
      );
    });
  }

  loadAppointments(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentUseCase
      .getAllAppointments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointments) => {

          const sorted = this.sortPendingAppointments(appointments);

          this.dataSource.data = sorted;
          this.filteredAppointments = [...sorted];

          this.appointmentUseCase
            .getPendingClosureAlert()
            .pipe(takeUntil(this.destroy$))
            .subscribe(alert => {
              this.pendingClosureAlert = alert;
            });

          this.isLoading = false;
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = 'No se pudieron cargar las citas';
          this.isLoading = false;
        }
      });
  }

  abrirNuevaCita(): void {
    const dialogRef = this.dialog.open(
      AppointmentsDialogComponent,
      { width: '500px' }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadAppointments();
    });
  }

  abrirEditarCita(appointment: Appointment): void {
    const dialogRef = this.dialog.open(
      AppointmentsDialogComponent,
      {
        width: '500px',
        data: { appointment }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadAppointments();
    });
  }

  openDetail(appointment: Appointment): void {
    this.dialog.open(AppointmentDetail, {
      width: '500px',
      data: appointment
    });
  }

  cambiarEstado(
    appointment: Appointment,
    status: Appointment['status']
  ): void {

    const updatedAppointment = {
      ...appointment,
      status
    };

    this.appointmentUseCase
      .updateStatus(updatedAppointment)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAppointments());
  }

  abrirCierreAsistido(appointment: Appointment): void {
    const dialogRef = this.dialog.open(
      AppointmentCloseDialogComponent,
      {
        width: '420px',
        data: appointment
      }
    );

    dialogRef.afterClosed().subscribe(result => {

      if (!result) return;

      this.appointmentUseCase
        .assistedClose(
          appointment.id ?? '',
          result.payment_method,
          Number(result.tip || 0)
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadAppointments());
    });
  }

  private sortPendingAppointments(
    appointments: Appointment[]
  ): Appointment[] {

    return appointments
      .filter(
        appt =>
          appt.status === AppointmentStatus.PENDING ||
          appt.status === AppointmentStatus.PENDING_CLOSURE
      )
      .sort(
        (a, b) =>
          this.getAppointmentTimestamp(a) -
          this.getAppointmentTimestamp(b)
      );
  }

  private getAppointmentTimestamp(
    appointment: Appointment
  ): number {

    if (!appointment.date) {
      return Number.MAX_SAFE_INTEGER;
    }

    const hour =
      appointment.hour?.slice(0, 5) ?? '00:00';

    const dateTime =
      new Date(`${appointment.date}T${hour}:00`);

    return Number.isNaN(dateTime.getTime())
      ? Number.MAX_SAFE_INTEGER
      : dateTime.getTime();
  }

  formatDate(date: string): string {
    if (!date) return 'Sin fecha';

    const parsed = this.parseDateWithoutTimezone(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  private parseDateWithoutTimezone(
    date: string
  ): Date {

    const raw = String(date || '').slice(0, 10);

    const [year, month, day] =
      raw.split('-').map(Number);

    if (!year || !month || !day) {
      return new Date(date);
    }

  return new Date(year, month - 1, day);
}

private toAmPm(hour?: string): string {
  const rawHour = String(hour ?? '').slice(0, 5);

  if (!rawHour) {
    return 'Sin hora';
  }

  const [hourPart, minutePart] = rawHour.split(':');
  const hourNumber = Number(hourPart);

  if (Number.isNaN(hourNumber)) {
    return rawHour;
  }

  const minute = minutePart?.padStart(2, '0') ?? '00';
  const period = hourNumber >= 12 ? 'p.m.' : 'a.m.';
  const normalizedHour = ((hourNumber + 11) % 12) + 1;

  return `${normalizedHour}:${minute} ${period}`;
}

private generarMensaje(appointment: Appointment): string {
  const nombre = appointment.client?.name ?? 'cliente';
  const fecha = this.formatDate(appointment.date);
  const hora = this.toAmPm(appointment.hour);
  const servicio = appointment.service?.name ?? 'tu servicio';

  return `Hola ${nombre}

Te recordamos tu cita en *Le Barber Club*

Fecha: ${fecha}
Hora: ${hora}
Servicio: ${servicio}

Te esperamos.`;
}

recordarCita(appointment: Appointment): void {
  const mensaje = this.generarMensaje(appointment);
  navigator.clipboard.writeText(mensaje).catch((error) => {
    console.error('No se pudo copiar el mensaje de recordatorio', error);
  });
}

abrirWhatsApp(appointment: Appointment): void {
  const telefono = appointment.client?.phone;
  if (!telefono) {
    return;
  }

  const mensaje = encodeURIComponent(this.generarMensaje(appointment));
  const url = `https://wa.me/${telefono}?text=${mensaje}`;
  window.open(url, '_blank');
}
  getStatusLabel(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.CONFIRMED:
        return 'Confirmada';
      case AppointmentStatus.COMPLETED:
        return 'Finalizada';
      case AppointmentStatus.PENDING:
        return 'Pendiente';
      case AppointmentStatus.PENDING_CLOSURE:
        return 'Pendiente de cierre';
      case AppointmentStatus.CANCELLED:
        return 'Cancelada';
      default:
        return 'Desconocido';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}