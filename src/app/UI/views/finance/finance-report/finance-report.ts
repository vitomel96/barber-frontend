import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FinanceUseCase } from '../../../../domain/models/Finance/usecase/financeusecase';
import { FinanceMonthlyReport } from '../../../../domain/models/Finance/FinanceReport';
import { GenericFormModule } from '../../../../infraestructure/helpers/generic-form-module/generic-form.module';

@Component({
  selector: 'app-finance-report',
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
  templateUrl: './finance-report.html',
  styleUrl: './finance-report.scss'
})
export class FinanceReportComponent implements OnInit {
  selectedMonthDate = new Date();
  report?: FinanceMonthlyReport;

  constructor(private financeUseCase: FinanceUseCase) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.financeUseCase.getMonthlyReport(this.selectedMonth).subscribe({
      next: (report) => {
        this.report = report;
      },
      error: (error) => console.error(error)
    });
  }

  onMonthSelected(monthDate: Date, picker: any): void {
    this.selectedMonthDate = monthDate;
    picker.close();
    this.loadReport();
  }

  get selectedMonth(): string {
    const year = this.selectedMonthDate.getFullYear();
    const month = String(this.selectedMonthDate.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  exportExcel(): void {
    if (!this.report) return;
    const r = this.report;
    const lines: string[] = [];
    lines.push('Reporte Financiero');
    lines.push(`Mes,${r.month}`);
    lines.push(`Ingresos,${r.summary.income}`);
    lines.push(`Egresos Totales,${r.summary.totalExpenses}`);
    lines.push(`Ganancia/Perdida Neta,${r.summary.net}`);
    lines.push(`Margen,${r.metrics.margin}`);
    lines.push(`Propinas Mes,${r.metrics.tipsMonth}`);
    lines.push('');
    lines.push('Top Pagos Barberos');
    lines.push('Barbero,Total');
    r.topCommissions.forEach((item) => {
      lines.push(`${this.csv(item.barberName)},${item.total}`);
    });
    lines.push('');
    lines.push('Recomendaciones');
    lines.push('Nivel,Titulo,Mensaje');
    r.recommendations.forEach((item) => {
      lines.push(`${item.level},${this.csv(item.title)},${this.csv(item.message)}`);
    });
    this.downloadCsv(lines.join('\n'), `reporte-financiero-${r.month}.csv`);
  }

  exportPdf(): void {
    if (!this.report) return;
    const r = this.report;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Reporte Financiero</title></head><body>
      <h1>Reporte Financiero General</h1>
      <p><strong>Mes:</strong> ${r.month}</p>
      <p><strong>Ingresos:</strong> $${r.summary.income}</p>
      <p><strong>Egresos:</strong> $${r.summary.totalExpenses}</p>
      <p><strong>Neto:</strong> $${r.summary.net}</p>
      <p><strong>Margen:</strong> ${r.metrics.margin.toFixed(1)}%</p>
      <h3>Recomendaciones</h3>
      <ul>${r.recommendations.map((x) => `<li><strong>${x.title}</strong>: ${x.message}</li>`).join('')}</ul>
      <h3>Top Pagos a Barberos</h3>
      <ul>${r.topCommissions.map((x) => `<li>${x.barberName}: $${x.total}</li>`).join('')}</ul>
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
