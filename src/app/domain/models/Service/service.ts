export class Service {
  id?: string;

  name!: string;

  duration!: number; 
  price!: number;
  barber_commission_percent!: number;

  is_active?: boolean;

  created_at?: string;
  updated_at?: string;
}
