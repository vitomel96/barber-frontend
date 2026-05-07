import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericService } from '../../helpers/generic.service';
import { environment } from '../../../../environments/environment';
import { AppointmentGateway } from '../../../domain/models/Appointment/gateway/appointment-gateway';
import { Appointment } from '../../../domain/models/Appointment/Appointment';
import { AppointmentStatus } from '../../../domain/models/Appointment/AppointmentStatus';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService extends AppointmentGateway {

  private _url = environment.backendURL;

  constructor(private genericService: GenericService) {
    super();
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.genericService.get<Appointment[]>(this._url, 'appointments');
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.genericService.get<Appointment[]>(this._url, `appointments/date?value=${date}`);
  }

  getAppointmentsByBarber(barberId: string, date: string): Observable<Appointment[]> {
    return this.genericService.get<Appointment[]>(this._url, `appointments/barber/${barberId}?date=${date}`);
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.genericService.get<Appointment>(this._url, `appointments/${id}`);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.genericService.post<Appointment>(this._url, 'appointments', appointment);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    return this.genericService.patch<Appointment>(
      this._url,
      `appointments/${appointment.id}`,
      appointment
    );
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<Appointment> {
    return this.genericService.patch<Appointment>(this._url, `appointments/${id}/status`, { status });
  }

  assistedClose(id: string, payment_method: string, tip: number): Observable<Appointment> {
    return this.genericService.patch<Appointment>(this._url, `appointments/${id}/close`, { payment_method, tip });
  }

  getPendingClosureAlert(): Observable<{
    hasAlert: boolean;
    pendingCount: number;
    closingTime: string;
    minutesToClose: number;
  }> {
    return this.genericService.get(this._url, 'appointments/pending-closure-alert');
  }

  cancelAppointment(id: string): Observable<void> {
    return this.genericService.put<void>(this._url, `appointments/cancel/${id}`, {});
  }

  deleteAppointment(id: string): Observable<void> {
    return this.genericService.delete<void>(this._url, `appointments/${id}`);
  }
}
