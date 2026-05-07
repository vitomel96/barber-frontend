import { AppointmentStatus } from "./AppointmentStatus";

export class Appointment {
  id?: string;
  client_id!: string;
  client?: any;
  barber?: any;
  service?: any;
  barber_id!: string;
  service_id!: string;
  date!: string; 
  hour!: string; 
  duration!: number;
  price!: number;
  payment_method?: string;
  tip?: number;
  closed_at?: string;
  status!: AppointmentStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
