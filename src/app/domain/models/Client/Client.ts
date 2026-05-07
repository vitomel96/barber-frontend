export class Client {
  id?: string;

  name!: string;
  last_name?: string;

  phone!: string;
  email?: string;

  points?: number;
visits?: number;
last_visit?: string;
  is_active?: boolean;
  source?: string;
  created_at?: string;
  updated_at?: string;
  has_history?: boolean;
  birth_date?: any;
  referred_by_client?: any | null;
  referred_by_barber?: any | null;
}
