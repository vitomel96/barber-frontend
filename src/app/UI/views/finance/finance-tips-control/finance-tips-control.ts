import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FinanceUseCase } from '../../../../domain/models/Finance/usecase/financeusecase';
import { TipsControlResponse } from '../../../../domain/models/Finance/FinanceReport';
import { GenericFormModule } from '../../../../infraestructure/helpers/generic-form-module/generic-form.module';

@Component({
  selector: 'app-finance-tips-control',
  standalone: true,
  imports: [
    CommonModule,
    GenericFormModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './finance-tips-control.html',
  styleUrl: './finance-tips-control.scss'
})
export class FinanceTipsControlComponent implements OnInit {
  selectedMonthDate = new Date();
  data?: TipsControlResponse;

  constructor(private financeUseCase: FinanceUseCase) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.financeUseCase.getTipsControl(this.selectedMonth).subscribe({
      next: (data) => {
        this.data = data;
      },
      error: (error) => console.error(error)
    });
  }

  onMonthSelected(monthDate: Date, picker: any): void {
    this.selectedMonthDate = monthDate;
    picker.close();
    this.loadData();
  }

  get selectedMonth(): string {
    const year = this.selectedMonthDate.getFullYear();
    const month = String(this.selectedMonthDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  exportExcel(): void {
    if (!this.data) return;

    const lines: string[] = [];
    lines.push('Control de Propinas');
    lines.push(`Fecha,${this.data.date}`);
    lines.push(`Mes,${this.data.month}`);
    lines.push(`Propinas Hoy,${this.data.totals.tipsToday}`);
    lines.push(`Propinas Mes,${this.data.totals.tipsMonth}`);
    lines.push('');
    lines.push('Propinas por barbero (hoy)');
    lines.push('Barbero,Total');
    this.data.byBarberToday.forEach((item) => {
      lines.push(`${this.csv(item.barberName)},${item.totalTips}`);
    });
    lines.push('');
    lines.push('Propinas por barbero (mes)');
    lines.push('Barbero,Total');
    this.data.byBarberMonth.forEach((item) => {
      lines.push(`${this.csv(item.barberName)},${item.totalTips}`);
    });
    lines.push('');
    lines.push('Propinas diarias del mes');
    lines.push('Fecha,Total');
    this.data.dailyMonth.forEach((item) => {
      lines.push(`${item.date},${item.totalTips}`);
    });

    this.downloadCsv(lines.join('\n'), `propinas-${this.data.month}.csv`);
  }

  exportPdf(): void {
    if (!this.data) return;

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <html><head><title>Control de Propinas</title></head><body>
      <h1>Control de Propinas</h1>
      <p><strong>Fecha:</strong> ${this.data.date}</p>
      <p><strong>Mes:</strong> ${this.data.month}</p>
      <p><strong>Propinas Hoy:</strong> $${this.data.totals.tipsToday}</p>
      <p><strong>Propinas Mes:</strong> $${this.data.totals.tipsMonth}</p>
      <h3>Por barbero (hoy)</h3>
      <ul>${this.data.byBarberToday.map((x) => `<li>${x.barberName}: $${x.totalTips}</li>`).join('')}</ul>
      <h3>Por barbero (mes)</h3>
      <ul>${this.data.byBarberMonth.map((x) => `<li>${x.barberName}: $${x.totalTips}</li>`).join('')}</ul>
      <h3>Diario del mes</h3>
      <ul>${this.data.dailyMonth.map((x) => `<li>${x.date}: $${x.totalTips}</li>`).join('')}</ul>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  private downloadCsv(content: string, filename: string): void {
    const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private csv(value: string): string {
    const safe = String(value || '').replace(/"/g, '""');
    return `"${safe}"`;
  }
}
