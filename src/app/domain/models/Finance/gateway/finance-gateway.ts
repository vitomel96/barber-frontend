import { Observable } from 'rxjs';
import { FinanceRecord } from '../FinanceRecord';
import { FinanceType } from '../FinanceType';
import {
  BarberCommissionSummary,
  FinanceMonthlySummary
} from '../FinanceMonthlySummary';
import { FinanceMonthlyReport, TipsControlResponse } from '../FinanceReport';

export abstract class FinanceGateway {
  abstract getRecords(type?: FinanceType, month?: string): Observable<FinanceRecord[]>;
  abstract createRecord(record: Partial<FinanceRecord>): Observable<FinanceRecord>;
  abstract updateRecord(id: string, record: Partial<FinanceRecord>): Observable<FinanceRecord>;
  abstract deleteRecord(id: string): Observable<void>;
  abstract getMonthlySummary(month?: string): Observable<FinanceMonthlySummary>;
  abstract getBarberCommissions(month?: string): Observable<BarberCommissionSummary[]>;
  abstract getMonthlyReport(month?: string): Observable<FinanceMonthlyReport>;
  abstract getTipsControl(month?: string, date?: string): Observable<TipsControlResponse>;
}
