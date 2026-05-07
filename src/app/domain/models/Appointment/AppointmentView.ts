import { Appointment } from "./Appointment";

export interface AppointmentView extends Appointment {
  client_name?: string;
  barber_name?: string;
  service_name?: string;
}
