import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FinanceGateway } from '../gateway/finance-gateway';
import { FinanceRecord } from '../FinanceRecord';
import { FinanceType } from '../FinanceType';
import {
  BarberCommissionSummary,
  FinanceMonthlySummary
} from '../FinanceMonthlySummary';
import { FinanceMonthlyReport, TipsControlResponse } from '../FinanceReport';

@Injectable({
  providedIn: 'root'
})
export class FinanceUseCase {
  constructor(private financeGateway: FinanceGateway) {}

  getRecords(type?: FinanceType, month?: string): Observable<FinanceRecord[]> {
    return this.financeGateway.getRecords(type, month);
  }

  createRecord(record: Partial<FinanceRecord>): Observable<FinanceRecord> {
    return this.financeGateway.createRecord(record);
  }

  createCashRegisterSale(sale: any): Observable<FinanceRecord> {
    return this.financeGateway.createCashRegisterSale(sale);
  }

  updateRecord(id: string, record: Partial<FinanceRecord>): Observable<FinanceRecord> {
    return this.financeGateway.updateRecord(id, record);
  }

  deleteRecord(id: string): Observable<void> {
    return this.financeGateway.deleteRecord(id);
  }

  getMonthlySummary(month?: string): Observable<FinanceMonthlySummary> {
    return this.financeGateway.getMonthlySummary(month);
  }

  getBarberCommissions(month?: string): Observable<BarberCommissionSummary[]> {
    return this.financeGateway.getBarberCommissions(month);
  }

  getMonthlyReport(month?: string): Observable<FinanceMonthlyReport> {
    return this.financeGateway.getMonthlyReport(month);
  }

  getTipsControl(month?: string, date?: string): Observable<TipsControlResponse> {
    return this.financeGateway.getTipsControl(month, date);
  }
}
