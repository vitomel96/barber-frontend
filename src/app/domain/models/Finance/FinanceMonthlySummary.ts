export interface FinanceMonthlySummary {
  month: string;
  income: number;
  expense: number;
  fixedExpense: number;
  barberCommission: number;
  totalExpenses: number;
  incomeAfterCommission: number;
  net: number;
}

export interface BarberCommissionSummary {
  barberId: string;
  barberName: string;
  total: number;
}
