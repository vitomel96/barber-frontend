import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, filter, startWith, switchMap, takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AppointmentUseCase } from '../../../../domain/models/Appointment/usecase/appointmentusecase';
import { ClientUseCase } from '../../../../domain/models/Client/usecase/clientusecase';
import { ServiceUseCase } from '../../../../domain/models/Service/usecase/serviceusecase';
import { BarberUseCase } from '../../../../domain/models/Barber/usecase/barberusecase';
import { Appointment } from '../../../../domain/models/Appointment/Appointment';
import { AppointmentStatus } from '../../../../domain/models/Appointment/AppointmentStatus';
import { TimeFormatPipe } from '../../../pipes/time-format.pipe';

@Component({
  selector: 'app-appointments-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TimeFormatPipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './appointments-dialog.html',
})
export class AppointmentsDialogComponent implements OnInit, OnDestroy {
  private readonly slotIntervalMinutes = 5;

  isEditMode = false;
  appointment!: any;
  form!: FormGroup;

  clients: any[] = [];
  services: any[] = [];
  barbers: any[] = [];

  clientSearchControl = new FormControl<string>('', { nonNullable: true });
  serviceSearchControl = new FormControl<string>('', { nonNullable: true });
  barberSearchControl = new FormControl<string>('', { nonNullable: true });

  availableSlots: string[] = [];
  calculatedEndTime = '';
  selectedService: any;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private appointmentUseCase: AppointmentUseCase,
    private clientUseCase: ClientUseCase,
    private serviceUseCase: ServiceUseCase,
    private barberUseCase: BarberUseCase,
    private dialogRef: MatDialogRef<AppointmentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.data?.appointment;

    this.form = this.fb.group({
      client_id: ['', Validators.required],
      barber_id: ['', Validators.required],
      service_id: ['', Validators.required],
      date: ['', Validators.required],
      start_time: ['', Validators.required],
      notes: ['']
    });

    this.prefillData();
    this.loadInitialData();
    this.listenFormChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar Cita' : 'Nueva Cita';
  }

  get filteredClients(): any[] {
    return this.filterCollection(this.clients, this.resolveClientTerm(), (item) =>
      `${item?.name || ''} ${item?.last_name || ''} ${item?.phone || ''}`
    );
  }

  get filteredServices(): any[] {
    return this.filterCollection(this.services, this.resolveServiceTerm(), (item) =>
      `${item?.name || ''} ${item?.duration || ''}`
    );
  }

  get filteredBarbers(): any[] {
    return this.filterCollection(this.barbers, this.resolveBarberTerm(), (item) =>
      `${item?.name || ''} ${item?.last_name || ''}`
    );
  }

  private filterCollection(
    collection: any[],
    term: string,
    textGetter: (item: any) => string
  ): any[] {
    const normalizedTerm = this.normalizeText(term);
    if (!normalizedTerm) {
      return collection;
    }

    return collection.filter((item) =>
      this.normalizeText(textGetter(item)).includes(normalizedTerm)
    );
  }

  private normalizeText(value: string): string {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private prefillData(): void {
    if (this.data?.client) {
      this.form.patchValue({
        client_id: this.data.client.id
      });
    }

    if (this.data?.barber) {
      this.form.patchValue({
        barber_id: this.data.barber.id
      });
    }

    if (this.data?.barberId) {
      this.form.patchValue({
        barber_id: this.data.barberId
      });
    }

    if (this.data?.start) {
      const start = new Date(this.data.start);

      this.form.patchValue({
        date: start,
        start_time: this.fromMinutes(start.getHours() * 60 + start.getMinutes())
      });
    }
  }

  private loadInitialData(): void {
    combineLatest([
      this.clientUseCase.getAllClients(),
      this.serviceUseCase.getAllServices(),
      this.barberUseCase.getAllBarbers()
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([clients, services, barbers]) => {
        this.clients = clients;
        this.services = services;
        this.barbers = barbers;

        if (this.isEditMode) {
          this.loadAppointmentData();
        }
      });
  }

  private loadAppointmentData(): void {
    this.appointment = this.data.appointment;

    this.form.patchValue({
      client_id: this.appointment.client?.id,
      barber_id: this.appointment.barber?.id,
      service_id: this.appointment.service?.id,
      date: new Date(this.appointment.date),
      start_time: this.appointment.hour?.slice(0, 5),
      notes: this.appointment.notes
    });

    this.selectedService = this.services.find(
      (service) => service.id === this.appointment.service?.id
    );
    this.clientSearchControl.setValue(this.appointment.client?.id || '', {
      emitEvent: false,
    });
    this.barberSearchControl.setValue(this.appointment.barber?.id || '', {
      emitEvent: false,
    });
    this.serviceSearchControl.setValue(this.appointment.service?.id || '', {
      emitEvent: false,
    });

    this.calculateEndTime();
    this.refreshSlotsIfPossible();
  }

  private listenFormChanges(): void {
    combineLatest([
      this.form.get('barber_id')!.valueChanges.pipe(
        startWith(this.form.get('barber_id')!.value)
      ),
      this.form.get('date')!.valueChanges.pipe(
        startWith(this.form.get('date')!.value)
      )
    ])
      .pipe(
        debounceTime(200),
        filter(([barberId, date]) => !!barberId && !!date),
        switchMap(([barberId, date]) =>
          this.appointmentUseCase.getAppointmentsByBarber(
            barberId,
            this.formatDate(date)
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((appointments) => {
        this.generateAvailableSlots(appointments);
      });

    this.form.get('service_id')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((serviceId) => {
        this.selectedService = this.services.find((service) => service.id === serviceId);
        this.calculateEndTime();
        this.refreshSlotsIfPossible();
      });

    this.form.get('start_time')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateEndTime());
  }

  private refreshSlotsIfPossible(): void {
    const barberId = this.form.get('barber_id')!.value;
    const date = this.form.get('date')!.value;

    if (!barberId || !date) {
      return;
    }

    this.appointmentUseCase
      .getAppointmentsByBarber(barberId, this.formatDate(date))
      .pipe(takeUntil(this.destroy$))
      .subscribe((appointments) => this.generateAvailableSlots(appointments));
  }

  private generateAvailableSlots(appointments: any[]): void {
    const barberId = this.form.get('barber_id')!.value;
    const barber = this.barbers.find((item) => item.id === barberId);

    if (!barber || !this.selectedService) {
      this.availableSlots = [];
      return;
    }

    const baseSlots = this.generateTimeSlots(
      barber.start_time,
      barber.end_time,
      this.slotIntervalMinutes
    );
    const barberEnd = this.toMinutes(barber.end_time);

    this.availableSlots = baseSlots.filter((slot) => {
      const startMinutes = this.toMinutes(slot);
      const endMinutes = startMinutes + Number(this.selectedService.duration || 0);

      if (endMinutes > barberEnd) {
        return false;
      }

      return !this.isSlotOccupied(slot, appointments);
    });

    if (!this.availableSlots.includes(this.form.value.start_time)) {
      this.form.patchValue({ start_time: '' });
    }
  }

  private isSlotOccupied(slot: string, appointments: any[]): boolean {
    if (!this.selectedService) {
      return false;
    }

    const serviceDuration = Number(this.selectedService.duration || 0);
    const slotStart = this.toMinutes(slot);
    const slotEnd = slotStart + serviceDuration;
    const selectedDate = this.formatDate(this.form.get('date')!.value);

    return appointments
      .filter(
        (appointment) =>
          appointment.status !== 'CANCELLED' &&
          appointment.status !== 'COMPLETED' &&
          appointment.date === selectedDate &&
          appointment.id !== this.appointment?.id
      )
      .some((appointment) => {
        const appointmentStart = this.toMinutes(appointment.hour.slice(0, 5));
        const appointmentEnd = appointmentStart + Number(appointment.duration || 0);
        return slotStart < appointmentEnd && slotEnd > appointmentStart;
      });
  }

  private generateTimeSlots(start: string, end: string, interval: number): string[] {
    const slots: string[] = [];
    let current = this.toMinutes(start);
    const finish = this.toMinutes(end);

    while (current < finish) {
      slots.push(this.fromMinutes(current));
      current += interval;
    }

    return slots;
  }

  private calculateEndTime(): void {
    this.calculatedEndTime = '';

    if (!this.selectedService) {
      return;
    }

    const startTime = this.form.get('start_time')!.value;
    if (!startTime) {
      return;
    }

    const total = this.toMinutes(startTime) + Number(this.selectedService.duration || 0);
    this.calculatedEndTime = this.fromMinutes(total);
  }

  private toMinutes(time: string): number {
    const [hours, minutes] = String(time || '00:00').split(':').map(Number);
    return hours * 60 + minutes;
  }

  private fromMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  private formatDate(date: Date): string {
    const parsed = new Date(date);
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  save(): void {
    if (this.form.invalid || !this.selectedService) {
      this.form.markAllAsTouched();
      return;
    }

    const appointment: Appointment = {
      ...this.appointment,
      client_id: this.form.value.client_id,
      barber_id: this.form.value.barber_id,
      service_id: this.form.value.service_id,
      date: this.formatDate(this.form.value.date),
      hour: this.form.value.start_time,
      duration: Number(this.selectedService.duration || 0),
      price: Number(this.selectedService.price || 0),
      notes: this.form.value.notes,
      status: this.appointment?.status || AppointmentStatus.PENDING
    };

    const request = this.isEditMode
      ? this.appointmentUseCase.updateAppointment(appointment)
      : this.appointmentUseCase.createAppointment(appointment);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: async () => {
        await Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Cita actualizada' : 'Cita agendada con exito'
        });
        this.dialogRef.close(true);
      },
      error: async (error) => {
        await Swal.fire({
          icon: 'error',
          title: error?.error?.message || 'No se pudo guardar la cita'
        });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  selectClient(clientId: string): void {
    this.form.patchValue({ client_id: clientId });
    this.clientSearchControl.setValue(clientId, {
      emitEvent: false,
    });
  }

  selectBarber(barberId: string): void {
    this.form.patchValue({ barber_id: barberId, start_time: '' });
    this.barberSearchControl.setValue(barberId, {
      emitEvent: false,
    });
    this.refreshSlotsIfPossible();
  }

  selectService(serviceId: string): void {
    const service = this.services.find((item) => item.id === serviceId);
    if (!service) {
      return;
    }

    this.form.patchValue({ service_id: serviceId, start_time: '' });
    this.serviceSearchControl.setValue(serviceId, {
      emitEvent: false,
    });
    this.selectedService = service;
    this.calculateEndTime();
    this.refreshSlotsIfPossible();
  }

  displayClient = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') {
      const byId = this.clients.find((client) => client.id === value);
      if (byId) return `${byId.name || ''} ${byId.last_name || ''}`.trim();
      return value;
    }
    return `${value.name || ''} ${value.last_name || ''}`.trim();
  };

  displayBarber = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') {
      const byId = this.barbers.find((barber) => barber.id === value);
      if (byId) return `${byId.name || ''} ${byId.last_name || ''}`.trim();
      return value;
    }
    return `${value.name || ''} ${value.last_name || ''}`.trim();
  };

  displayService = (value: any): string => {
    if (!value) return '';
    if (typeof value === 'string') {
      const byId = this.services.find((service) => service.id === value);
      if (byId) return byId.name || '';
      return value;
    }
    return value.name || '';
  };

  private resolveClientTerm(): string {
    const value = this.clientSearchControl.value || '';
    const byId = this.clients.find((client) => client.id === value);
    return byId ? '' : value;
  }

  private resolveBarberTerm(): string {
    const value = this.barberSearchControl.value || '';
    const byId = this.barbers.find((barber) => barber.id === value);
    return byId ? '' : value;
  }

  private resolveServiceTerm(): string {
    const value = this.serviceSearchControl.value || '';
    const byId = this.services.find((service) => service.id === value);
    return byId ? '' : value;
  }
}
