export class Barber {
  id?: string;

  name!: string;
  last_name?: string;

  phone!: string;
  email?: string;
  photo_url?: string;

  start_time!: string; 
  end_time!: string;  

  day_off!: number; 

  is_active?: boolean;
  appointmentsToday?: number;
  appointmentsMonth?: number;
  ocupation?: number;
  ingress?: number;
  created_at?: string;
  updated_at?: string;
}
