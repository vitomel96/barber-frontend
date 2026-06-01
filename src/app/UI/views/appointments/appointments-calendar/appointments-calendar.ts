import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, DatesSetArg, EventContentArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { MatDialog } from '@angular/material/dialog';
import esLocale from '@fullcalendar/core/locales/es';
import { AppointmentUseCase } from '../../../../domain/models/Appointment/usecase/appointmentusecase';
import { Barber } from '../../../../domain/models/Barber/barber';
import { BarberUseCase } from '../../../../domain/models/Barber/usecase/barberusecase';
import { Appointment } from '../../../../domain/models/Appointment/Appointment';
import { GenericFormModule } from '../../../../infraestructure/helpers/generic-form-module/generic-form.module';
import { AppointmentsDialogComponent } from '../appointments-dialog/appointments-dialog';
import { AppointmentStatus } from '../../../../domain/models/Appointment/AppointmentStatus';

@Component({
  selector: 'app-appointments-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, GenericFormModule],
  templateUrl: './appointments-calendar.html',
  styleUrl: './appointments-calendar.scss'
})
export class AppointmentsCalendarComponent implements OnInit {

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  barbers: Barber[] = [];
  selectedBarberId!: string;

  currentStartDate!: string;
  currentEndDate!: string;

  calendarOptions!: CalendarOptions;

  constructor(
    private appointmentUseCase: AppointmentUseCase,
    private barberUseCase: BarberUseCase,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBarbers();
    this.initializeCalendar();
  }

  // ==============================
  // CARGAR BARBEROS
  // ==============================
  loadBarbers() {
    this.barberUseCase.getAllBarbers().subscribe({
      next: (barbers) => this.barbers = barbers,
      error: (err) => console.error(err)
    });
  }

  // ==============================
  // CONFIG CALENDARIO
  // ==============================
 initializeCalendar() {
  this.calendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    selectable: true,
    height: 'auto',
    slotDuration: '00:05:00',
    snapDuration: '00:05:00',
    slotLabelInterval: '00:30:00',
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    },
    eventMinHeight: 68,
    locale: esLocale, // ✅ aquí ponemos español

    datesSet: (arg: DatesSetArg) => {
      this.currentStartDate = arg.startStr;
      this.currentEndDate = arg.endStr;
      this.loadAppointments();
    },

    select: (info) => {
      if (!this.selectedBarberId) return;
      this.openCreateDialog(info.start, info.end);
    },
    eventClick: (info) => {
  const appointment: Appointment = info.event.extendedProps['appointment'];
  this.openAppointmentSummary(appointment);
},
    eventContent: (arg) => this.renderEventContent(arg),
    events: []
  };
}
openAppointmentSummary(appointment: Appointment) {
  const dialogRef = this.dialog.open(AppointmentsDialogComponent, {
    width: '450px',
    data: {
      appointment
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadAppointments();
    }
  });
}

  // ==============================
  // CARGAR CITAS
  // ==============================
loadAppointments() {
  if (!this.selectedBarberId || !this.currentStartDate) return;

  const calendarApi = this.calendarComponent.getApi();
  calendarApi.removeAllEvents();

  const start = new Date(this.currentStartDate);
  const end = new Date(this.currentEndDate);

  const days: string[] = [];

  // 🔹 Construir array de días visibles
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split('T')[0]);
  }

  // 🔹 Por cada día llamar al backend
  
    this.appointmentUseCase
      .getAppointmentsByBarber(this.selectedBarberId, '')
      .subscribe({
        next: (appointments: Appointment[]) => {

  const events = appointments.map(a => {
  const startDate = new Date(`${a.date}T${a.hour}`);
  const endDate = new Date(startDate.getTime() + a.duration * 60000);

  return {
    id: a.id,
    title: this.buildEventTitle(a),
    start: startDate,
    end: endDate,
    classNames: this.getStatusClass(a.status),
    extendedProps: {
      appointment: a
    }
  };
});
          calendarApi.addEventSource(events);
        },
        error: (err) => console.error(err)
      });
  
}

private buildEventTitle(appointment: Appointment): string {
  const clientName = this.buildFullName(
    appointment.client?.name,
    appointment.client?.last_name
  );
  const serviceName = appointment.service?.name ?? 'Servicio';
  const price = this.formatPrice(appointment.price);

  return `${clientName} - ${serviceName} - ${price}`;
}

private buildFullName(name?: string, lastName?: string): string {
  const fullName = [name, lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Cliente';
}

private formatPrice(price?: number): string {
  if (price == null || Number.isNaN(Number(price))) {
    return '$0';
  }

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(price);
}

private renderEventContent(arg: EventContentArg): { domNodes: Node[] } {
  const appointment = arg.event.extendedProps['appointment'] as Appointment | undefined;

  const clientName = this.buildFullName(
    appointment?.client?.name,
    appointment?.client?.last_name
  );
  const serviceName = appointment?.service?.name ?? 'Servicio';
  const timeLabel = arg.timeText || '';

  const wrapper = document.createElement('div');
  wrapper.className = 'appointment-event-content';

  const clientLine = document.createElement('div');
  clientLine.className = 'appointment-event-client';
  clientLine.textContent = clientName;

  const serviceLine = document.createElement('div');
  serviceLine.className = 'appointment-event-service';
  serviceLine.textContent = serviceName;

  const timeLine = document.createElement('div');
  timeLine.className = 'appointment-event-time';
  timeLine.textContent = timeLabel;

  wrapper.appendChild(clientLine);
  wrapper.appendChild(serviceLine);
  wrapper.appendChild(timeLine);

  return { domNodes: [wrapper] };
}

private getStatusClass(status: AppointmentStatus): string[] {
  switch (status) {
    case AppointmentStatus.PENDING:
      return ['event-pending'];

    case AppointmentStatus.COMPLETED:
      return ['event-completed'];

    case AppointmentStatus.CANCELLED:
      return ['event-cancelled'];

    default:
      return [];
  }
}
  // ==============================
  // CAMBIO DE BARBERO
  // ==============================
onBarberChange(barberId: string) {
  if (!barberId) return;
  this.selectedBarberId = barberId;
  this.loadAppointments();
}

  // ==============================
  // ABRIR MODAL
  // ==============================
  openCreateDialog(start: Date, end: Date) {
    const dialogRef = this.dialog.open(AppointmentsDialogComponent, {
      width: '450px',
      data: {
        start,
        end,
        barberId: this.selectedBarberId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAppointments();
      }
    });
  }
}
