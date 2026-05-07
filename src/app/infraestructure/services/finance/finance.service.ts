import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FinanceGateway } from '../../../domain/models/Finance/gateway/finance-gateway';
import { FinanceRecord } from '../../../domain/models/Finance/FinanceRecord';
import { FinanceType } from '../../../domain/models/Finance/FinanceType';
import {
  BarberCommissionSummary,
  FinanceMonthlySummary
} from '../../../domain/models/Finance/FinanceMonthlySummary';
import {
  FinanceMonthlyReport,
  TipsControlResponse
} from '../../../domain/models/Finance/FinanceReport';
import { GenericService } from '../../helpers/generic.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceService extends FinanceGateway {
  private _url = environment.backendURL;

  constructor(private genericService: GenericService) {
    super();
  }

  getRecords(type?: FinanceType, month?: string): Observable<FinanceRecord[]> {
    const query: string[] = [];
    if (type) query.push(`type=${type}`);
    if (month) query.push(`month=${month}`);
    const endpoint = query.length ? `finances?${query.join('&')}` : 'finances';
    return this.genericService.get<FinanceRecord[]>(this._url, endpoint);
  }

  createRecord(record: Partial<FinanceRecord>): Observable<FinanceRecord> {
    return this.genericService.post<FinanceRecord>(this._url, 'finances', record);
  }

  updateRecord(id: string, record: Partial<FinanceRecord>): Observable<FinanceRecord> {
    return this.genericService.patch<FinanceRecord>(this._url, `finances/${id}`, record);
  }

  deleteRecord(id: string): Observable<void> {
    return this.genericService.delete<void>(this._url, `finances/${id}`);
  }

  getMonthlySummary(month?: string): Observable<FinanceMonthlySummary> {
    const endpoint = month
      ? `finances/monthly-summary?month=${month}`
      : 'finances/monthly-summary';
    return this.genericService.get<FinanceMonthlySummary>(this._url, endpoint);
  }

  getBarberCommissions(month?: string): Observable<BarberCommissionSummary[]> {
    const endpoint = month
      ? `finances/barber-commissions?month=${month}`
      : 'finances/barber-commissions';
    return this.genericService.get<BarberCommissionSummary[]>(this._url, endpoint);
  }

  getMonthlyReport(month?: string): Observable<FinanceMonthlyReport> {
    const endpoint = month
      ? `finances/monthly-report?month=${month}`
      : 'finances/monthly-report';
    return this.genericService.get<FinanceMonthlyReport>(this._url, endpoint);
  }

  getTipsControl(month?: string, date?: string): Observable<TipsControlResponse> {
    const query: string[] = [];
    if (month) query.push(`month=${month}`);
    if (date) query.push(`date=${date}`);
    const endpoint = query.length
      ? `appointments/tips-control?${query.join('&')}`
      : 'appointments/tips-control';
    return this.genericService.get<TipsControlResponse>(this._url, endpoint);
  }
}
