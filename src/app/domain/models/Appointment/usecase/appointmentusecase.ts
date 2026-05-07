import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Appointment } from "../Appointment";
import { AppointmentGateway } from "../gateway/appointment-gateway";

@Injectable({
  providedIn: "root",
})
export class AppointmentUseCase {

  constructor(private appointmentGateway: AppointmentGateway) {}

  getAllAppointments(): Observable<Appointment[]> {
    return this.appointmentGateway.getAllAppointments();
  }

    getAppointmentsByBarber(barberId: string, date: string): Observable<Appointment[]> {
    return this.appointmentGateway.getAppointmentsByBarber(barberId, date);
  }

  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.appointmentGateway.getAppointmentsByDate(date);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.appointmentGateway.createAppointment(appointment);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    return this.appointmentGateway.updateAppointment(appointment);
  }

  updateStatus(appointment: Appointment): Observable<Appointment>{
    return this.appointmentGateway.updateStatus(appointment.id ?? '', appointment.status)
  }

  assistedClose(id: string, payment_method: string, tip: number): Observable<Appointment> {
    return this.appointmentGateway.assistedClose(id, payment_method, tip);
  }

  getPendingClosureAlert(): Observable<{
    hasAlert: boolean;
    pendingCount: number;
    closingTime: string;
    minutesToClose: number;
  }> {
    return this.appointmentGateway.getPendingClosureAlert();
  }

  cancelAppointment(id: string): Observable<void> {
    return this.appointmentGateway.cancelAppointment(id);
  }

}
