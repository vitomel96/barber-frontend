export interface FinanceMonthlySummary {
  month: string;
  income: number;
  expense: number;
  fixedExpense: number;
  barberCommission: number;
  totalExpenses: number;
  net: number;
}

export interface BarberCommissionSummary {
  barberId: string;
  barberName: string;
  total: number;
}

