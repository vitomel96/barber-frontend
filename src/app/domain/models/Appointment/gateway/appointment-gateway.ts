import { Observable } from 'rxjs';
import { Appointment } from '../Appointment';
import { AppointmentStatus } from '../AppointmentStatus';

export abstract class AppointmentGateway {

  abstract getAllAppointments(): Observable<Appointment[]>;

  abstract getAppointmentsByDate(date: string): Observable<Appointment[]>;

  abstract getAppointmentsByBarber(barberId: string, date: string): Observable<Appointment[]>;

  abstract getAppointmentById(id: string): Observable<Appointment>;

  abstract createAppointment(appointment: Appointment): Observable<Appointment>;

  abstract updateAppointment(appointment: Appointment): Observable<Appointment>;

  abstract updateStatus(id: string, status: AppointmentStatus): Observable<Appointment>;
  
  abstract assistedClose(id: string, payment_method: string, tip: number): Observable<Appointment>;

  abstract getPendingClosureAlert(): Observable<{
    hasAlert: boolean;
    pendingCount: number;
    closingTime: string;
    minutesToClose: number;
  }>;

  abstract cancelAppointment(id: string): Observable<void>;

  abstract deleteAppointment(id: string): Observable<void>;
}
