import { FinanceType } from './FinanceType';

export class FinanceRecord {
  id?: string;
  type!: FinanceType;
  description!: string;
  amount!: number;
  date!: string;
  category?: string;
  payment_method?: string;
  invoice_url?: string;
  invoice_file_name?: string;
  notes?: string;
  barber_id?: string;
  barber?: any;
  client?: any;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
