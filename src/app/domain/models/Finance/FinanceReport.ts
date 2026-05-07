import { FinanceMonthlySummary } from './FinanceMonthlySummary';

export interface FinanceRecommendation {
  level: 'good' | 'warning' | 'critical';
  title: string;
  message: string;
}

export interface FinanceMonthlyReport {
  month: string;
  summary: FinanceMonthlySummary;
  metrics: {
    margin: number;
    fixedShare: number;
    commissionShare: number;
    tipsMonth: number;
  };
  topCommissions: Array<{
    barberId: string;
    barberName: string;
    total: number;
  }>;
  recommendations: FinanceRecommendation[];
}

export interface TipsControlResponse {
  month: string;
  date: string;
  totals: {
    tipsToday: number;
    tipsMonth: number;
  };
  byBarberToday: Array<{
    barberId: string;
    barberName: string;
    totalTips: number;
  }>;
  byBarberMonth: Array<{
    barberId: string;
    barberName: string;
    totalTips: number;
  }>;
  dailyMonth: Array<{
    date: string;
    totalTips: number;
  }>;
}

